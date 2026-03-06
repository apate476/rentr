'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScoreSelector } from '@/components/score-selector'
import type { ReviewState } from './actions'

const SCORE_FIELDS = [
  { name: 'score_overall', label: 'Overall', emoji: '🏠' },
  { name: 'score_value', label: 'Value for money', emoji: '💰' },
  { name: 'score_landlord', label: 'Landlord / management', emoji: '👤' },
  { name: 'score_noise', label: 'Noise level', emoji: '🔊' },
  { name: 'score_pests', label: 'Pest-free', emoji: '🐛' },
  { name: 'score_safety', label: 'Safety', emoji: '🛡️' },
  { name: 'score_parking', label: 'Parking', emoji: '🚗' },
  { name: 'score_pets', label: 'Pet-friendly', emoji: '🐾' },
  { name: 'score_neighborhood', label: 'Neighborhood', emoji: '🏙️' },
]

const LEASE_TYPES = ['month-to-month', '1-year', '2-year', 'other']
const CURRENT_YEAR = new Date().getFullYear()

interface ReviewWizardProps {
  propertyId: string
  action: (prevState: ReviewState, formData: FormData) => Promise<ReviewState>
}

export function ReviewWizard({ propertyId: _, action }: ReviewWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 5

  // Form state
  const [scores, setScores] = useState<Record<string, number | null>>(
    Object.fromEntries(SCORE_FIELDS.map((f) => [f.name, null]))
  )
  const [body, setBody] = useState('')
  const [moveInYear, setMoveInYear] = useState('')
  const [moveOutYear, setMoveOutYear] = useState('')
  const [stillLive, setStillLive] = useState(false)
  const [rentAmount, setRentAmount] = useState('')
  const [leaseType, setLeaseType] = useState('')
  const [wouldRentAgain, setWouldRentAgain] = useState<'yes' | 'no' | null>(null)

  const [state, formAction, isPending] = useActionState(action, { error: null })

  function buildFormData(): FormData {
    const fd = new FormData()
    SCORE_FIELDS.forEach((f) => scores[f.name] && fd.set(f.name, String(scores[f.name])))
    fd.set('body', body)
    if (moveInYear) fd.set('move_in_year', moveInYear)
    if (!stillLive && moveOutYear) fd.set('move_out_year', moveOutYear)
    if (rentAmount) fd.set('rent_amount', rentAmount)
    if (leaseType) fd.set('lease_type', leaseType)
    if (wouldRentAgain) fd.set('would_rent_again', wouldRentAgain)
    return fd
  }

  function canAdvance(): boolean {
    if (step === 2) return SCORE_FIELDS.every((f) => scores[f.name] !== null)
    if (step === 3) return body.trim().length >= 50
    return true
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progressPct)}% complete</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step 1 — Tenancy details */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">Your tenancy</h2>
          <p className="text-muted-foreground text-sm">
            Help readers understand your experience. All fields are optional.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Move-in year</Label>
              <Input
                type="number"
                placeholder="2021"
                min={1970}
                max={CURRENT_YEAR}
                value={moveInYear}
                onChange={(e) => setMoveInYear(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Move-out year</Label>
              <Input
                type="number"
                placeholder={stillLive ? '—' : '2023'}
                min={1970}
                max={CURRENT_YEAR}
                value={stillLive ? '' : moveOutYear}
                onChange={(e) => setMoveOutYear(e.target.value)}
                disabled={stillLive}
                className="rounded-lg"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={stillLive}
              onChange={(e) => setStillLive(e.target.checked)}
              className="rounded"
            />
            I still live here
          </label>

          <div className="space-y-1.5">
            <Label>Monthly rent (optional)</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                $
              </span>
              <Input
                type="number"
                placeholder="1500"
                min={0}
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="rounded-lg pl-7"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Lease type (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {LEASE_TYPES.map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setLeaseType(lt === leaseType ? '' : lt)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    leaseType === lt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-primary/40'
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Scores */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
            Rate this property
          </h2>
          <p className="text-muted-foreground text-sm">
            All scores are required (1 = poor, 5 = great).
          </p>
          <div className="space-y-5">
            {SCORE_FIELDS.map((f) => (
              <ScoreSelector
                key={f.name}
                name={f.name}
                label={f.label}
                emoji={f.emoji}
                value={scores[f.name]}
                onChange={(val) => setScores((s) => ({ ...s, [f.name]: val }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Body */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
            Write your review
          </h2>
          <p className="text-muted-foreground text-sm">
            Share your experience honestly. Your identity will never be revealed.
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What was living here actually like? Describe the landlord, maintenance, neighbors, building condition…"
            rows={8}
            className="border-input bg-background w-full rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex justify-between text-xs">
            <span className={body.length < 50 ? 'text-destructive' : 'text-muted-foreground'}>
              {body.length < 50 ? `${50 - body.length} more characters needed` : '✓ Minimum met'}
            </span>
            <span className="text-muted-foreground">{body.length} / 2000</span>
          </div>
        </div>
      )}

      {/* Step 4 — Final details */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
            One last thing
          </h2>
          <div className="space-y-3">
            <p className="text-sm font-medium">Would you rent here again?</p>
            <div className="flex gap-3">
              {(['yes', 'no'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWouldRentAgain(wouldRentAgain === val ? null : val)}
                  className={`rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
                    wouldRentAgain === val
                      ? val === 'yes'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-400 bg-red-50 text-red-600'
                      : 'hover:border-primary/40'
                  }`}
                >
                  {val === 'yes' ? '👍 Yes' : '👎 No'}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-sm">
            <p className="font-medium">Your privacy is protected</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Your review will appear as &ldquo;Anonymous Tenant&rdquo;. Your name, email, and
              account are never visible to anyone.
            </p>
          </div>
        </div>
      )}

      {/* Step 5 — Preview + submit */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
            Preview your review
          </h2>

          <div className="bg-card space-y-4 rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-bold ${
                    (scores.score_overall ?? 0) >= 4
                      ? 'text-green-600'
                      : (scores.score_overall ?? 0) >= 3
                        ? 'text-yellow-600'
                        : 'text-red-500'
                  }`}
                >
                  {scores.score_overall}/5
                </span>
                {wouldRentAgain !== null && (
                  <span className="text-muted-foreground text-xs">
                    {wouldRentAgain === 'yes' ? '✓ Would rent again' : "✗ Wouldn't rent again"}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                Anonymous Tenant ·{' '}
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {(moveInYear || rentAmount) && (
              <p className="text-muted-foreground text-xs">
                {moveInYear && (
                  <>
                    {moveInYear}
                    {!stillLive && moveOutYear ? `–${moveOutYear}` : '–present'}
                  </>
                )}
                {rentAmount && moveInYear && ' · '}
                {rentAmount && `$${Number(rentAmount).toLocaleString()}/mo`}
                {leaseType && ` · ${leaseType}`}
              </p>
            )}

            <p className="text-sm leading-relaxed">{body}</p>

            <div className="grid grid-cols-3 gap-2 border-t pt-3">
              {SCORE_FIELDS.slice(1).map((f) => (
                <div key={f.name} className="text-center text-xs">
                  <span className="mr-1">{f.emoji}</span>
                  <span className="font-medium">{scores[f.name]}</span>
                  <span className="text-muted-foreground"> {f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {state.error && (
            <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
              {state.error}
            </p>
          )}

          <form action={formAction}>
            {/* Hidden fields */}
            {SCORE_FIELDS.map((f) => (
              <input key={f.name} type="hidden" name={f.name} value={scores[f.name] ?? ''} />
            ))}
            <input type="hidden" name="body" value={body} />
            {moveInYear && <input type="hidden" name="move_in_year" value={moveInYear} />}
            {!stillLive && moveOutYear && (
              <input type="hidden" name="move_out_year" value={moveOutYear} />
            )}
            {rentAmount && <input type="hidden" name="rent_amount" value={rentAmount} />}
            {leaseType && <input type="hidden" name="lease_type" value={leaseType} />}
            {wouldRentAgain && (
              <input type="hidden" name="would_rent_again" value={wouldRentAgain} />
            )}

            <Button type="submit" disabled={isPending} className="w-full rounded-full" size="lg">
              {isPending ? 'Submitting…' : 'Submit review'}
            </Button>
          </form>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => (step === 1 ? router.back() : setStep((s) => s - 1))}
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </Button>

        {step < TOTAL_STEPS && (
          <Button
            type="button"
            disabled={!canAdvance()}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full px-6"
          >
            Continue →
          </Button>
        )}
      </div>
    </div>
  )
}
