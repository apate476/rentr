'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { updateProfile, updatePassword, updateEmail, deleteAccount } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { Trash2, Loader2 } from 'lucide-react'

type SettingsState = {
  error: string | null
  success: string | null
}

const initialState: SettingsState = { error: null, success: null }

interface SettingsFormProps {
  user: User
  displayName: string
}

export function SettingsForm({ user, displayName: initialDisplayName }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState)
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, initialState)
  const [emailState, emailAction, emailPending] = useActionState(updateEmail, initialState)
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, initialState)

  // Show toast notifications
  if (profileState.success) {
    toast.success(profileState.success)
    profileState.success = null
  }
  if (passwordState.success) {
    toast.success(passwordState.success)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    passwordState.success = null
  }
  if (emailState.success) {
    toast.success(emailState.success)
    setNewEmail('')
    emailState.success = null
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="border-warm-border bg-warm-card">
        <CardHeader>
          <CardTitle className="text-warm-text">Profile</CardTitle>
          <CardDescription className="text-warm-muted">
            Update your display name and account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-warm-text">
                Display Name
              </Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="border-warm-border bg-warm-bg text-warm-text"
              />
              <p className="text-xs text-warm-muted">
                This name will be shown on your profile
              </p>
            </div>

            {profileState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {profileState.error}
              </p>
            )}

            <Button
              type="submit"
              disabled={profilePending}
              className="bg-warm-text text-warm-card hover:bg-warm-text/90"
            >
              {profilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border-warm-border bg-warm-card">
        <CardHeader>
          <CardTitle className="text-warm-text">Email</CardTitle>
          <CardDescription className="text-warm-muted">
            Change your email address. You&apos;ll need to verify the new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-1">
            <p className="text-sm font-medium text-warm-text">Current Email</p>
            <p className="text-sm text-warm-muted">{user.email}</p>
          </div>

          <form action={emailAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_email" className="text-warm-text">
                New Email
              </Label>
              <Input
                id="new_email"
                name="new_email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                autoComplete="email"
                className="border-warm-border bg-warm-bg text-warm-text"
              />
            </div>

            {emailState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {emailState.error}
              </p>
            )}

            <Button
              type="submit"
              disabled={emailPending || !newEmail}
              className="bg-warm-text text-warm-card hover:bg-warm-text/90"
            >
              {emailPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="border-warm-border bg-warm-card">
        <CardHeader>
          <CardTitle className="text-warm-text">Password</CardTitle>
          <CardDescription className="text-warm-muted">
            Change your password. Make sure it&apos;s at least 8 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-warm-text">
                Current Password
              </Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="border-warm-border bg-warm-bg text-warm-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-warm-text">
                New Password
              </Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="border-warm-border bg-warm-bg text-warm-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-warm-text">
                Confirm New Password
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="border-warm-border bg-warm-bg text-warm-text"
              />
            </div>

            {passwordState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {passwordState.error}
              </p>
            )}

            <Button
              type="submit"
              disabled={passwordPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="bg-warm-text text-warm-card hover:bg-warm-text/90"
            >
              {passwordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete_confirm" className="text-red-900">
                  Type &quot;DELETE&quot; to confirm
                </Label>
                <Input
                  id="delete_confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-300 bg-white text-red-900"
                />
              </div>

              {deleteState.error && (
                <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
                  {deleteState.error}
                </p>
              )}

              <div className="flex gap-3">
                <form action={deleteAction}>
                  <input type="hidden" name="confirm_text" value={deleteConfirmText} />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={deletePending || deleteConfirmText !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Delete
                  </Button>
                </form>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="border-red-300 text-red-900 hover:bg-red-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
