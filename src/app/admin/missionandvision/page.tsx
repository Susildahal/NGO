'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Plus, Trash2, Heart, Lightbulb, Target, Zap, Leaf, Users, Award, Star, Shield, Compass, Rocket, Smile, Handshake, BookOpen, Eye } from 'lucide-react';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function MissionVisionApproach() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    approaches: [{ title: '', description: '', icon: 'Heart' }],
    stats: [{ value: '', label: '' }],
  });

  // Icon options for Core Values
  const iconOptions = [
    { name: 'Heart', Icon: Heart },
    { name: 'Lightbulb', Icon: Lightbulb },
    { name: 'Target', Icon: Target },
    { name: 'Zap', Icon: Zap },
    { name: 'Leaf', Icon: Leaf },
    { name: 'Users', Icon: Users },
    { name: 'Award', Icon: Award },
    { name: 'Star', Icon: Star },
    { name: 'Shield', Icon: Shield },
    { name: 'Compass', Icon: Compass },
    { name: 'Rocket', Icon: Rocket },
    { name: 'Smile', Icon: Smile },
    { name: 'Handshake', Icon: Handshake },
    { name: 'BookOpen', Icon: BookOpen },
    { name: 'Eye', Icon: Eye },
  ];

  // Fetch data from Firebase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const docRef = doc(db, 'pages', 'missionVisionApproach');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            mission: data.mission || '',
            vision: data.vision || '',
            approaches: data.approaches && data.approaches.length > 0 
              ? data.approaches.map((app: any) => ({
                  title: app.title || '',
                  description: app.description || '',
                  icon: app.icon || 'Heart'
                }))
              : [{ title: '', description: '', icon: 'Heart' }],
            stats: data.stats && data.stats.length > 0
              ? data.stats.map((stat: any) => ({
                  value: stat.value || '',
                  label: stat.label || ''
                }))
              : [{ value: '', label: '' }],
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
  };

  const getCharacterStatus = (length: number, min: number = 200, max: number = 500) => {
    if (length < min) return { color: 'text-red-600', bgColor: 'bg-red-50', status: 'Too short', percentage: (length / max) * 100 };
    if (length >= min && length <= max) return { color: 'text-green-600', bgColor: 'bg-green-50', status: 'Good', percentage: (length / max) * 100 };
    return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', status: 'Too long', percentage: 100 };
  };

  const handleApproachChange = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const newApproaches = [...formData.approaches];
    newApproaches[index] = { ...newApproaches[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      approaches: newApproaches
    }));
    setSuccess(false);
  };

  const addApproach = () => {
    setFormData(prev => ({
      ...prev,
      approaches: [...prev.approaches, { title: '', description: '', icon: 'Heart' }]
    }));
  };

  const removeApproach = (index: number) => {
    setFormData(prev => ({
      ...prev,
      approaches: prev.approaches.filter((_, i) => i !== index)
    }));
  };

  const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      stats: newStats
    }));
    setSuccess(false);
  };

 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate character limits
      const missionStatus = getCharacterStatus(formData.mission.length);
      const visionStatus = getCharacterStatus(formData.vision.length);

      if (formData.mission.length < 200 || formData.mission.length > 500) {
        setError('Mission must be between 200 and 500 characters');
        setLoading(false);
        return;
      }

      if (formData.vision.length < 200 || formData.vision.length > 500) {
        setError('Vision must be between 200 and 500 characters');
        setLoading(false);
        return;
      }

      // Filter out empty approaches and stats
      const validApproaches = formData.approaches.filter(
        app => app.title && app.description
      );

      const validStats = formData.stats.filter(
        stat => stat.value && stat.label
      );

      // Save to Firebase
      await setDoc(doc(db, 'pages', 'missionVisionApproach'), {
        mission: formData.mission,
        vision: formData.vision,
        approaches: validApproaches,
        stats: validStats,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save. Make sure Firebase is configured.';
      setError(errorMessage);
      console.error('Error saving:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 ">
    <div className=" mx-auto">
      <Card>
        <CardHeader>
        <CardTitle>Mission, Vision & Core Values</CardTitle>
        <CardDescription>
          Define your organization's mission, vision, Core Values and statistics
        </CardDescription>
        </CardHeader>
        <CardContent>
        {fetchingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Loading content...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Content saved successfully!</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Mission and Vision - 2 columns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mission & Vision</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mission">Mission * (200-500 characters)</Label>
                <textarea
                  id="mission"
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  placeholder="What is your organization's mission?"
                  required
                  maxLength={500}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                />
                <div className={`mt-2 p-3 rounded-md ${getCharacterStatus(formData.mission.length).bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${getCharacterStatus(formData.mission.length).color}`}>
                      {getCharacterStatus(formData.mission.length).status}
                    </span>
                    <span className="text-sm text-gray-600">{formData.mission.length}/500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        formData.mission.length < 200 ? 'bg-red-600' : 
                        formData.mission.length <= 500 ? 'bg-green-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${getCharacterStatus(formData.mission.length).percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="vision">Vision * (200-500 characters)</Label>
                <textarea
                  id="vision"
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  placeholder="What is your organization's vision?"
                  required
                  maxLength={500}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                />
                <div className={`mt-2 p-3 rounded-md ${getCharacterStatus(formData.vision.length).bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${getCharacterStatus(formData.vision.length).color}`}>
                      {getCharacterStatus(formData.vision.length).status}
                    </span>
                    <span className="text-sm text-gray-600">{formData.vision.length}/500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        formData.vision.length < 200 ? 'bg-red-600' : 
                        formData.vision.length <= 500 ? 'bg-green-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${getCharacterStatus(formData.vision.length).percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Approaches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Core Values</h3>
              <Button
                type="button"
                onClick={addApproach}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Core Values
              </Button>
              </div>

              <div className="space-y-4">
              {formData.approaches.map((approach, index) => {
                const SelectedIcon = iconOptions.find(opt => opt.name === approach.icon)?.Icon || Heart;
                return (
                  <Card key={index} className="bg-gray-50 dark:bg-accent">
                    <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`approach-title-${index}`}>Core Values title</Label>
                        <Input
                        id={`approach-title-${index}`}
                        type="text"
                        value={approach.title}
                        onChange={(e) => handleApproachChange(index, 'title', e.target.value)}
                        placeholder="e.g., Community Engagement"
                        className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`approach-icon-${index}`}>Select Icon</Label>
                        <select
                          id={`approach-icon-${index}`}
                          value={approach.icon}
                          onChange={(e) => handleApproachChange(index, 'icon', e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {iconOptions.map(opt => (
                            <option key={opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200 flex items-center justify-center">
                          <SelectedIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>

                      <div className="relative lg:flex lg:flex-col">
                        <Label htmlFor={`approach-desc-${index}`}>Description</Label>
                        <div className="flex gap-2 mt-2">
                        <Input
                          id={`approach-desc-${index}`}
                          value={approach.description}
                          onChange={(e) => handleApproachChange(index, 'description', e.target.value)}
                          placeholder="Describe this Core Values..."
                        />
                        {formData.approaches.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeApproach(index)}
                            variant="destructive"
                            size="icon"
                            className="self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>

            {/* Fixed Stats Section */}
            <div className="space-y-4 ">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Statistics</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { defaultValue: '10K+', defaultLabel: 'Lives Impacted' },
                { defaultValue: '50+', defaultLabel: 'Communities' },
                { defaultValue: '100%', defaultLabel: 'Dedication' },
              ].map((def, index) => {
                const stat = formData.stats[index] || { value: '', label: '' };
                return (
                  <Card key={index} className="bg-blue-50 dark:bg-accent border-blue-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>  
                      <Label htmlFor={`stat-value-${index}`}>Value/Number</Label>
                      <Input
                        id={`stat-value-${index}`}
                        type="text"
                        value={stat.value || def.defaultValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (formData.stats[index]) {
                          handleStatChange(index, 'value', val);
                          } else {
                          setFormData(prev => {
                            const newStats = [...prev.stats];
                            while (newStats.length <= index) newStats.push({ value: '', label: '' });
                            newStats[index].value = val;
                            return { ...prev, stats: newStats };
                          });
                          }
                        }}
                        placeholder={def.defaultValue}
                        className="mt-2"
                      />
                      </div>

                      <div>
                      <Label htmlFor={`stat-label-${index}`}>Label</Label>
                      <Input
                        id={`stat-label-${index}`}
                        type="text"
                        value={stat.label || def.defaultLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (formData.stats[index]) {
                          handleStatChange(index, 'label', val);
                          } else {
                          setFormData(prev => {
                            const newStats = [...prev.stats];
                            while (newStats.length <= index) newStats.push({ value: '', label: '' });
                            newStats[index].label = val;
                            return { ...prev, stats: newStats };
                          });
                          }
                        }}
                        placeholder={def.defaultLabel}
                        className="mt-2"
                      />
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Content'}
            </Button>
          </form>
        )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}