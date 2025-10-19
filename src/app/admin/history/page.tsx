'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Trash2, CheckCircle, AlertCircle, Moon } from 'lucide-react';

interface Journey {
  year: string;
  title: string;
  description: string;
  keyAchievements: string[];
}

interface FormData {
  livesTransformed: string;
  communitiesServed: string;
  programsCompleted: string;
  yearsOfImpact: string;
  journeys: Journey[];
  foundationStory: string;
}

const DynamicForm = () => {
  const [formData, setFormData] = useState<FormData>({
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
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);

  const storyLength = formData.foundationStory.length;
  const isStoryValid = storyLength >= 200 && storyLength <= 1000;
  
  const getCharCountColor = () => {
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
    setFormData(prev => ({
      ...prev,
      journeys: [...prev.journeys, { year: '', title: '', description: '', keyAchievements: [''] }]
    }));
  };

  const removeJourney = (index: number) => {
    setFormData(prev => ({
      ...prev,
      journeys: prev.journeys.filter((_, i) => i !== index)
    }));
  };

  const updateJourney = (index: number, field: keyof Journey, value: string) => {
    setFormData(prev => ({
      ...prev,
      journeys: prev.journeys.map((journey, i) => 
        i === index ? { ...journey, [field]: value } : journey
      )
    }));
  };

  const addAchievement = (journeyIndex: number) => {
    setFormData(prev => ({
      ...prev,
      journeys: prev.journeys.map((journey, i) => 
        i === journeyIndex 
          ? { ...journey, keyAchievements: [...journey.keyAchievements, ''] }
          : journey
      )
    }));
  };

  const removeAchievement = (journeyIndex: number, achievementIndex: number) => {
    setFormData(prev => ({
      ...prev,
      journeys: prev.journeys.map((journey, i) => 
        i === journeyIndex 
          ? { ...journey, keyAchievements: journey.keyAchievements.filter((_, ai) => ai !== achievementIndex) }
          : journey
      )
    }));
  };

  const updateAchievement = (journeyIndex: number, achievementIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      journeys: prev.journeys.map((journey, i) => 
        i === journeyIndex 
          ? {
              ...journey,
              keyAchievements: journey.keyAchievements.map((achievement, ai) => 
                ai === achievementIndex ? value : achievement
              )
            }
          : journey
      )
    }));
  };

  const handleSubmit = async () => {
    if (!isStoryValid) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSubmission = {
        ...formData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      setSubmittedData(prev => [...prev, formData]);
      console.log('Form Data Submitted:', newSubmission);
      setSubmitStatus('success');
      
      setFormData({
        livesTransformed: '',
        communitiesServed: '',
        programsCompleted: '',
        yearsOfImpact: '',
        journeys: [{ year: '', title: '', description: '', keyAchievements: [''] }],
        foundationStory: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="space-y-8">
              {/* Stats Section */}
              <div className="space-y-4">
                <Label className="text-2xl font-semibold text-slate-600 dark:text-slate-200">Impact Statistics</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Lives Transformed</Label>
                    <Input
                      placeholder="e.g., 2,500+"
                      value={formData.livesTransformed}
                      onChange={(e) => setFormData(prev => ({ ...prev, livesTransformed: e.target.value }))}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4 rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Communities Served</Label>
                    <Input
                      placeholder="e.g., 35"
                      value={formData.communitiesServed}
                      onChange={(e) => setFormData(prev => ({ ...prev, communitiesServed: e.target.value }))}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Programs Completed</Label>
                    <Input
                      placeholder="e.g., 75+"
                      value={formData.programsCompleted}
                      onChange={(e) => setFormData(prev => ({ ...prev, programsCompleted: e.target.value }))}
                      className="mt-2  border-slate-700  "
                    />
                  </div>

                  <div className="p-4  rounded-lg border border-slate-700">
                    <Label className="text-sm text-slate-400">Years of Impact</Label>
                    <Input
                      placeholder="e.g., 4"
                      value={formData.yearsOfImpact}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsOfImpact: e.target.value }))}
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
                  {formData.journeys.map((journey, journeyIndex) => (
                    <div key={journeyIndex} className="p-5  rounded-lg border border-slate-700 space-y-4">
                      <div className="flex items-start justify-between">
                        <Label className="text-lg font-semibold text-slate-300">Journey #{journeyIndex + 1}</Label>
                        {formData.journeys.length > 1 && (
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
                          {journey.keyAchievements.map((achievement, achievementIndex) => (
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
                  value={formData.foundationStory}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundationStory: e.target.value }))}
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

              {/* Submit Status */}
              {submitStatus === 'success' && (
                <Alert className="bg-green-950  border-green-800">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Form submitted successfully! Data ready for Firebase integration.
                  </AlertDescription>
                </Alert>
              )}
              
              {submitStatus === 'error' && (
                <Alert className="bg-red-950 border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Please ensure the foundation story is between 200-1000 characters.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !isStoryValid}
                className="w-full  font-semibold py-6 text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submitted Data Preview */}
        {submittedData.length > 0 && (
          <Card className="mt-6 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-slate-200">Submitted Data ({submittedData.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <pre className="text-xs admin text-slate-300 p-4 rounded border border-slate-800">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DynamicForm;