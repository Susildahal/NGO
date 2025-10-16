
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Trash2, Plus, Edit2 } from 'lucide-react';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function SiteSettings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const defaultForm = {
    siteName: '',
    siteDescription: '',
    phoneNumber: '',
    email: '',
    address: '',
    socialMedia: [{ name: '', url: '' }],
  };

  const [formData, setFormData] = useState(defaultForm);

  // Fetch existing settings from Firebase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetchingData(true);
        const docRef = doc(db, 'setting','setting');
        const docSnap = await getDoc(docRef);
        console.log('Fetched settings:', docSnap.data());

        if (docSnap.exists()) {
          const data = docSnap.data();
          const socialArray = data.socialMedia
            ? Object.entries(data.socialMedia).map(([name, url]) => ({ 
                name, 
                url: typeof url === 'string' ? url : ''
              }))
            : [{ name: '', url: '' }];

          setFormData({
            siteName: data.siteName || '',
            siteDescription: data.siteDescription || '',
            phoneNumber: data.phoneNumber || '',
            email: data.email || '',
            address: data.address || '',
            socialMedia: socialArray.length ? socialArray : [{ name: '', url: '' }],
          });
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
  };

  const handleSocialMediaChange = (index: number, field: 'name' | 'url', value: string) => {
    const newSocialMedia = [...formData.socialMedia];
    newSocialMedia[index][field] = value;
    setFormData(prev => ({
      ...prev,
      socialMedia: newSocialMedia
    }));
    setSuccess(false);
  };

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { name: '', url: '' }]
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert social media array to key-value pairs (object)
      const socialMediaObj: Record<string, string> = {};
      formData.socialMedia.forEach(item => {
        if (item.name && item.url) {
          socialMediaObj[item.name] = item.url;
        }
      });

      // Save to Firebase
      const settingsObj = {
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        socialMedia: socialMediaObj,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'setting', 'setting'), settingsObj);

      setSuccess(true);
      setIsEditing(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings. Make sure Firebase is configured.';
      setError(errorMessage);
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setSuccess(false);
    setError('');
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  {isEditing ? 'Edit your website information and social media links' : 'Create your website information and social media links'}
                </CardDescription>
              </div>
         
            </div>
          </CardHeader>
          <CardContent>
            {fetchingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">Settings saved successfully!</span>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}

                {/* Basic Information - 2 columns on laptop */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName">Site Name *</Label>
                      <Input
                        id="siteName"
                        name="siteName"
                        type="text"
                        value={formData.siteName}
                        onChange={handleChange}
                        placeholder="Enter your site name"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        name="siteDescription"
                        type="text"
                        value={formData.siteDescription}
                        onChange={handleChange}
                        placeholder="Brief description of your site"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="mt-2"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your business address"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links - Key Value */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Social Media</h3>
                    <Button
                      type="button"
                      onClick={addSocialMedia}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Social Media
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.socialMedia.map((social, index) => (
                      <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-end">
                        <div>
                          <Label htmlFor={`social-name-${index}`}>Platform Name</Label>
                          <Input
                            id={`social-name-${index}`}
                            type="text"
                            value={social.name}
                            onChange={(e) => handleSocialMediaChange(index, 'name', e.target.value)}
                            placeholder="e.g., Facebook, Twitter, Instagram"
                            className="mt-2"
                          />
                        </div>

                        <div className="relative">
                          <Label htmlFor={`social-url-${index}`}>URL</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id={`social-url-${index}`}
                              type="url"
                              value={social.url}
                              onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/profile"
                              className="flex-1"
                            />
                            {formData.socialMedia.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeSocialMedia(index)}
                                variant="destructive"
                                size="icon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update Settings' : 'Save Settings')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}