'use client';
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Zod validation schema
const historySchema = z.object({
  livesTransformed: z.string().min(1, 'Lives transformed is required'),
  communitiesServed: z.string().min(1, 'Communities served is required'),
  programsCompleted: z.string().min(1, 'Programs completed is required'),
  yearsOfImpact: z.string().min(1, 'Years of impact is required'),
  journeys: z.array(
    z.object({
      year: z.string().min(1, 'Year is required'),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      keyAchievements: z.array(z.string()).min(1, 'At least one achievement is required'),
    })
  ).min(1, 'At least one journey entry is required'),
  foundationStory: z.string()
    .min(200, 'Foundation story must be at least 200 characters')
    .max(1000, 'Foundation story must not exceed 1000 characters'),
});

type HistoryFormData = z.infer<typeof historySchema>;

const DynamicForm = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Initialize Formik with Zod validation
  const formik = useFormik<HistoryFormData>({
    initialValues: {
      livesTransformed: '',
      communitiesServed: '',
      programsCompleted: '',
      yearsOfImpact: '',
      journeys: [{
        year: '',
        title: '',
        description: '',
        keyAchievements: ['']
      }],
      foundationStory: ''
    },
    validationSchema: toFormikValidationSchema(historySchema),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Filter out empty achievements
        const cleanedJourneys = values.journeys.map((journey: {year: string; title: string; description: string; keyAchievements: string[]}) => ({
          ...journey,
          keyAchievements: journey.keyAchievements.filter((achievement: string) => achievement.trim() !== '')
        }));

        // Save to Firebase
        await setDoc(doc(db, 'pages', 'history'), {
          livesTransformed: values.livesTransformed,
          communitiesServed: values.communitiesServed,
          programsCompleted: values.programsCompleted,
          yearsOfImpact: values.yearsOfImpact,
          journeys: cleanedJourneys,
          foundationStory: values.foundationStory,
          updatedAt: new Date().toISOString(),
        });

        toast.success('History saved successfully!');
      } catch (err) {
        console.error('Error saving:', err);
        toast.error('Failed to save history. Please try again.');
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
        const docRef = doc(db, 'pages', 'history');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          formik.setValues({
            livesTransformed: data.livesTransformed || '',
            communitiesServed: data.communitiesServed || '',
            programsCompleted: data.programsCompleted || '',
            yearsOfImpact: data.yearsOfImpact || '',
            journeys: data.journeys && data.journeys.length > 0 
              ? data.journeys.map((journey: any) => ({
                  year: journey.year || '',
                  title: journey.title || '',
                  description: journey.description || '',
                  keyAchievements: journey.keyAchievements || ['']
                }))
              : [{ year: '', title: '', description: '', keyAchievements: [''] }],
            foundationStory: data.foundationStory || '',
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load history');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const storyLength = formik.values.foundationStory.length;
  const isStoryValid = storyLength >= 200 && storyLength <= 1000;  const getCharCountColor = () => {
    if (storyLength < 200) return 'text-red-400';
    if (storyLength >= 200 && storyLength <= 1000) return 'text-green-400';
    return 'text-orange-400';
  };

  const getCharCountBgColor = () => {
    if (storyLength < 200) return 'bg-red-950 border-red-800';
    if (storyLength >= 200 && storyLength <= 1000) return 'bg-green-950 border-green-800';
    return 'bg-orange-950 border-orange-800';
  };

  const addJourney = () => {
    formik.setFieldValue('journeys', [...formik.values.journeys, { year: '', title: '', description: '', keyAchievements: [''] }]);
  };

  const removeJourney = (index: number) => {
    formik.setFieldValue('journeys', formik.values.journeys.filter((_: any, i: number) => i !== index));
  };

  const updateJourney = (index: number, field: 'year' | 'title' | 'description', value: string) => {
    const newJourneys = [...formik.values.journeys];
    newJourneys[index] = { ...newJourneys[index], [field]: value };
    formik.setFieldValue('journeys', newJourneys);
  };

  const addAchievement = (journeyIndex: number) => {
    const newJourneys = [...formik.values.journeys];
    newJourneys[journeyIndex].keyAchievements = [...newJourneys[journeyIndex].keyAchievements, ''];
    formik.setFieldValue('journeys', newJourneys);
  };

  const removeAchievement = (journeyIndex: number, achievementIndex: number) => {
    const newJourneys = [...formik.values.journeys];
    newJourneys[journeyIndex].keyAchievements = newJourneys[journeyIndex].keyAchievements.filter((_: any, ai: number) => ai !== achievementIndex);
    formik.setFieldValue('journeys', newJourneys);
  };

  const updateAchievement = (journeyIndex: number, achievementIndex: number, value: string) => {
    const newJourneys = [...formik.values.journeys];
    newJourneys[journeyIndex].keyAchievements[achievementIndex] = value;
    formik.setFieldValue('journeys', newJourneys);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 ">
      <div className="mx-auto">
        <Card className=" ">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Foundation Form</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-200   ">
                  Enter your impact statistics, journey, and foundation story
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {fetchingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading history data...</p>
                </div>
              </div>
            ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-8">{formik.errors.foundationStory && formik.touched.foundationStory && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {formik.errors.foundationStory}
                  </AlertDescription>
                </Alert>
              )}
              {/* Stats Section */}
              <div className="space-y-4">
                <Label className="text-2xl font-semibold text-slate-600 dark:text-slate-200">Impact Statistics</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Lives Transformed</Label>
                    <Input
                      placeholder="e.g., 2,500+"
                      name="livesTransformed"
                      value={formik.values.livesTransformed}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4 rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Communities Served</Label>
                    <Input
                      placeholder="e.g., 35"
                      name="communitiesServed"
                      value={formik.values.communitiesServed}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Programs Completed</Label>
                    <Input
                      placeholder="e.g., 75+"
                      name="programsCompleted"
                      value={formik.values.programsCompleted}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Years of Impact</Label>
                    <Input
                      placeholder="e.g., 4"
                      name="yearsOfImpact"
                      value={formik.values.yearsOfImpact}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2  border-slate-700  "
                    />
                  </div>
                </div>
              </div>

              {/* Journey Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-2xl font-semibold text-slate-600 dark:text-slate-200">Journey</Label>
                  <Button 
                    type="button" 
                    onClick={addJourney}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2  border-slate-700 text-slate-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                   <p className=' text-black dark: '> Add Journey Entry </p> 
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formik.values.journeys.map((journey: {year: string; title: string; description: string; keyAchievements: string[]}, journeyIndex: number) => (
                    <div key={journeyIndex} className="p-5  rounded-lg border border-slate-700 space-y-4">
                      <div className="flex items-start justify-between">
                        <Label className="text-lg font-semibold text-slate-300">Journey #{journeyIndex + 1}</Label>
                        {formik.values.journeys.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeJourney(journeyIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-slate-400">Year</Label>
                          <Input
                            placeholder="e.g., 2021"
                            value={journey.year}
                            onChange={(e) => updateJourney(journeyIndex, 'year', e.target.value)}
                            className="mt-1  border-slate-700  "
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600 dark:text-slate-200">Title</Label>
                          <Input
                            placeholder="e.g., The Beginning"
                            value={journey.title}
                            onChange={(e) => updateJourney(journeyIndex, 'title', e.target.value)}
                            className="mt-1  border-slate-700  "
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-slate-400">Description</Label>
                        <Textarea
                          placeholder="Describe this part of your journey..."
                          value={journey.description}
                          onChange={(e) => updateJourney(journeyIndex, 'description', e.target.value)}
                          className="mt-1 admin border-slate-700   min-h-24 resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-slate-400">Key Achievements</Label>
                          <Button
                            type="button"
                            onClick={() => addAchievement(journeyIndex)}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <PlusCircle className="w-3 h-3 mr-1" />
                            Add Achievement
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {journey.keyAchievements.map((achievement: string, achievementIndex: number) => (
                            <div key={achievementIndex} className="flex gap-2">
                              <Input
                                placeholder={`Achievement ${achievementIndex + 1}`}
                                value={achievement}
                                onChange={(e) => updateAchievement(journeyIndex, achievementIndex, e.target.value)}
                                className="admin border-slate-700  "
                              />
                              {journey.keyAchievements.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeAchievement(journeyIndex, achievementIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foundation Story Section */}
              <div className="space-y-3">
                <Label className="text-2xl font-semibold text-slate-600 dark:text-slate-200 ">Foundation Story</Label>
                <Textarea
                  placeholder="Tell your foundation story (200-1000 characters)..."
                  name="foundationStory"
                  value={formik.values.foundationStory}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="min-h-40 resize-none border-slate-700 text-black dark: placeholder:text-slate-400 dark:"
                />
                
                {/* Character Counter */}
                <div className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${getCharCountBgColor()}`}>
                  <div className="flex items-center gap-2">
                    {isStoryValid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-semibold ${getCharCountColor()}`}>
                      {storyLength} / 1000 characters
                    </span>
                  </div>
                  <div className="text-sm">
                    {storyLength < 200 ? (
                      <span className="text-red-400 font-medium">
                        {200 - storyLength} more needed
                      </span>
                    ) : storyLength > 1000 ? (
                      <span className="text-orange-400 font-medium">
                        {storyLength - 1000} over limit
                      </span>
                    ) : (
                      <span className="text-green-400 font-medium">
                        ✓ Valid length
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Character status bar */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`absolute h-full transition-all duration-300 ${
                      storyLength < 200 ? 'bg-red-500' :
                      storyLength <= 1000 ? 'bg-green-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min((storyLength / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className="w-full  font-semibold py-6 text-lg"
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
};

export default DynamicForm;