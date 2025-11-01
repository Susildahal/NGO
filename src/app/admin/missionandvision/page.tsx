'use client';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Plus, Trash2, Heart, Lightbulb, Target, Zap, Leaf, Users, Award, Star, Shield, Compass, Rocket, Smile, Handshake, BookOpen, Eye } from 'lucide-react';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Zod validation schema
const missionVisionSchema = z.object({
  mission: z.string()
    .min(200, 'Mission must be at least 200 characters')
    .max(500, 'Mission must not exceed 500 characters'),
  vision: z.string()
    .min(200, 'Vision must be at least 200 characters')
    .max(500, 'Vision must not exceed 500 characters'),
  approaches: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      icon: z.string(),
    })
  ).min(1, 'At least one core value is required'),
  stats: z.array(
    z.object({
      value: z.string().min(1, 'Value is required'),
      label: z.string().min(1, 'Label is required'),
    })
  ).optional(),
});

type MissionVisionFormData = z.infer<typeof missionVisionSchema>;

export default function MissionVisionApproach() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

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

  // Formik setup with Zod validation
  const formik = useFormik<MissionVisionFormData>({
    initialValues: {
      mission: '',
      vision: '',
      approaches: [{ title: '', description: '', icon: 'Heart' }],
      stats: [
        { value: '10K+', label: 'Lives Impacted' },
        { value: '50+', label: 'Communities' },
        { value: '100%', label: 'Dedication' },
      ],
    },
    validationSchema: toFormikValidationSchema(missionVisionSchema),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Filter out empty entries
        const validApproaches = values.approaches.filter(
          (app: {title: string; description: string; icon: string}) => app.title && app.description
        );

        const validStats = values.stats?.filter(
          (stat: {value: string; label: string}) => stat.value && stat.label
        ) || [];

        // Save to Firebase
        await setDoc(doc(db, 'pages', 'missionVisionApproach'), {
          mission: values.mission,
          vision: values.vision,
          approaches: validApproaches,
          stats: validStats,
          updatedAt: new Date().toISOString(),
        });

        toast.success('Content saved successfully!');
      } catch (err) {
        console.error('Error saving:', err);
        toast.error('Failed to save content. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch data from Firebase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const docRef = doc(db, 'pages', 'missionVisionApproach');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          formik.setValues({
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
              : [
                  { value: '10K+', label: 'Lives Impacted' },
                  { value: '50+', label: 'Communities' },
                  { value: '100%', label: 'Dedication' },
                ],
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load content');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const getCharacterStatus = (length: number, min: number = 200, max: number = 500) => {
    if (length < min) return { color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', status: 'Too short', percentage: (length / max) * 100 };
    if (length >= min && length <= max) return { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', status: 'Good', percentage: (length / max) * 100 };
    return { color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', status: 'Too long', percentage: 100 };
  };

  const addApproach = () => {
    formik.setFieldValue('approaches', [...formik.values.approaches, { title: '', description: '', icon: 'Heart' }]);
  };

  const removeApproach = (index: number) => {
    const newApproaches = formik.values.approaches.filter((_: any, i: number) => i !== index);
    formik.setFieldValue('approaches', newApproaches);
  };

  const handleApproachChange = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const newApproaches = [...formik.values.approaches];
    newApproaches[index] = { ...newApproaches[index], [field]: value };
    formik.setFieldValue('approaches', newApproaches);
  };

  const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...(formik.values.stats || [])];
    while (newStats.length <= index) {
      newStats.push({ value: '', label: '' });
    }
    newStats[index] = { ...newStats[index], [field]: value };
    formik.setFieldValue('stats', newStats);
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
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {Object.keys(formik.errors).length > 0 && formik.submitCount > 0 && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <p className="font-semibold">Please fix the following errors:</p>
                  <ul className="list-disc list-inside mt-1">
                    {formik.errors.mission && <li>{formik.errors.mission}</li>}
                    {formik.errors.vision && <li>{formik.errors.vision}</li>}
                    {formik.errors.approaches && typeof formik.errors.approaches === 'string' && (
                      <li>{formik.errors.approaches}</li>
                    )}
                  </ul>
                </div>
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
                  value={formik.values.mission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="What is your organization's mission?"
                  maxLength={500}
                  className={`mt-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] bg-background ${
                    formik.touched.mission && formik.errors.mission ? 'border-red-500' : 'border-input'
                  }`}
                />
                <div className={`mt-2 p-3 rounded-md ${getCharacterStatus(formik.values.mission.length).bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${getCharacterStatus(formik.values.mission.length).color}`}>
                      {getCharacterStatus(formik.values.mission.length).status}
                    </span>
                    <span className="text-sm text-muted-foreground">{formik.values.mission.length}/500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        formik.values.mission.length < 200 ? 'bg-red-600' : 
                        formik.values.mission.length <= 500 ? 'bg-green-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${getCharacterStatus(formik.values.mission.length).percentage}%` }}
                    ></div>
                  </div>
                </div>
                {formik.touched.mission && formik.errors.mission && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.mission}</p>
                )}
              </div>

              <div>
                <Label htmlFor="vision">Vision * (200-500 characters)</Label>
                <textarea
                  id="vision"
                  name="vision"
                  value={formik.values.vision}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="What is your organization's vision?"
                  maxLength={500}
                  className={`mt-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] bg-background ${
                    formik.touched.vision && formik.errors.vision ? 'border-red-500' : 'border-input'
                  }`}
                />
                <div className={`mt-2 p-3 rounded-md ${getCharacterStatus(formik.values.vision.length).bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${getCharacterStatus(formik.values.vision.length).color}`}>
                      {getCharacterStatus(formik.values.vision.length).status}
                    </span>
                    <span className="text-sm text-muted-foreground">{formik.values.vision.length}/500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        formik.values.vision.length < 200 ? 'bg-red-600' : 
                        formik.values.vision.length <= 500 ? 'bg-green-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${getCharacterStatus(formik.values.vision.length).percentage}%` }}
                    ></div>
                  </div>
                </div>
                {formik.touched.vision && formik.errors.vision && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.vision}</p>
                )}
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
              {formik.values.approaches.map((approach: {title: string; description: string; icon: string}, index: number) => {
                const SelectedIcon = iconOptions.find(opt => opt.name === approach.icon)?.Icon || Heart;
                return (
                  <Card key={index} className="bg-muted/50">
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
                          className="mt-2 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        >
                          {iconOptions.map(opt => (
                            <option key={opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 p-2 bg-card rounded border border-border flex items-center justify-center">
                          <SelectedIcon className="w-6 h-6 text-primary" />
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
                        {formik.values.approaches.length > 1 && (
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
                const stat = formik.values.stats?.[index] || { value: '', label: '' };
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
                        onChange={(e) => handleStatChange(index, 'value', e.target.value)}
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
                        onChange={(e) => handleStatChange(index, 'label', e.target.value)}
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
              disabled={formik.isSubmitting || !formik.isValid}
              className="w-full"
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Content'}
            </Button>
          </form>
        )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}