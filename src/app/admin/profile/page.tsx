'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { auth } from '@/utils/firebase'
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, User } from 'lucide-react'


export default function ProfilePage() {
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Derive display name from email or Firebase user
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName
    const email = user?.email || formData.email
    return email ? email.split('@')[0].replace('.', ' ').toLowerCase() : 'User'
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email || '' }))
      }
    })

    return () => unsubscribe()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required to make changes'
      isValid = false
    }

    // New password and confirm password validation
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters'
        isValid = false
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Run client-side validation
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      if (!user) throw new Error('No user logged in')

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      )
      await reauthenticateWithCredential(user, credential)

      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email)
        toast.success('Email updated successfully')
      }

      // Update password if provided
      if (formData.newPassword) {
        await updatePassword(user, formData.newPassword)
        toast.success('Password updated successfully')
      }

      // Clear sensitive form data
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
        currentPassword: '',
      }))
      setErrors({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container max-w-2xl mx-auto "
    >
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-col items-center ">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold capitalize">
              Name: {getDisplayName()}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Email: {user.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Change Password</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2"

                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${errors.currentPassword ? 'border-red-500' : ''}`}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500">{errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  minLength={6}
                  required
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${errors.newPassword ? 'border-red-500' : ''}`}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                    required
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}