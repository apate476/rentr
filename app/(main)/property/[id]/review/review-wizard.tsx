'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScoreSelector } from '@/components/score-selector'
import type { ReviewState } from './actions'

const SCORE_FIELDS = [
  { name: 'score_overall', label: 'Overall', short: 'Overall' },
  { name: 'score_value', label: 'Value for money', short: 'Value' },
  { name: 'score_landlord', label: 'Landlord / management', short: 'Landlord' },
  { name: 'score_noise', label: 'Noise level', short: 'Noise' },
  { name: 'score_pests', label: 'Pest-free', short: 'Pests' },
  { name: 'score_safety', label: 'Safety', short: 'Safety' },
  { name: 'score_parking', label: 'Parking', short: 'Parking' },
  { name: 'score_pets', label: 'Pet-friendly', short: 'Pets' },
  { name: 'score_neighborhood', label: 'Neighborhood', short: 'Area' },
]

const LEASE_TYPES = ['month-to-month', '1-year', '2-year', 'other']
const CURRENT_YEAR = new Date().getFullYear()

const STEP_TITLES = [
  'Your tenancy',
  'Rate this property',
  'Write your review',
  'One last thing',
  'Preview & submit',
]

interface ReviewWizardProps {
  propertyId: string
  action: (prevState: ReviewState, formData: FormData) => Promise<ReviewState>
}

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-slate-100 text-slate-400'
  if (score >= 4) return 'bg-green-50 text-green-700'
  if (score >= 3) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

function borderClass(score: number | null): string {
  if (!score) return 'border-l-slate-300'
  if (score >= 4) return 'border-l-green-500'
  if (score >= 3) return 'border-l-amber-400'
  return 'border-l-red-400'
}

export function ReviewWizard({ action }: ReviewWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 5

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
  const [coachSuggestions, setCoachSuggestions] = useState<string[]>([])
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const coachTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, formAction, isPending] = useActionState(action, { error: null })

  useEffect(() => {
    if (step !== 3) return
    if (coachTimerRef.current) clearTimeout(coachTimerRef.current)
    if (body.length < 50) {
      setCoachSuggestions([])
      return
    }
    coachTimerRef.current = setTimeout(() => {
      fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, scores }),
      })
        .then((r) => r.json())
        .then((data) => {
          const filtered = (data.suggestions as string[]).filter(
            (s) => !dismissedSuggestions.has(s)
          )
          setCoachSuggestions(filtered)
        })
        .catch(() => {})
    }, 1500)
    return () => {
      if (coachTimerRef.current) clearTimeout(coachTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, step])

  function canAdvance(): boolean {
    if (step === 2) return SCORE_FIELDS.every((f) => scores[f.name] !== null)
    if (step === 3) return body.trim().length >= 50
    return true
  }

  const progressPct = (step / TOTAL_STEPS) * 100

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
          </span>
          <span className="text-xs text-slate-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step 1 — Tenancy */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900">
              Your tenancy
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Help readers understand your experience. All fields are optional.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">Move-in year</Label>
              <Input
                type="number"
                placeholder="2021"
                min={1970}
                max={CURRENT_YEAR}
                value={moveInYear}
                onChange={(e) => setMoveInYear(e.target.value)}
                className="rounded-lg border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Move-out year</Label>
              <Input
                type="number"
                placeholder={stillLive ? '—' : '2023'}
                min={1970}
                max={CURRENT_YEAR}
                value={stillLive ? '' : moveOutYear}
                onChange={(e) => setMoveOutYear(e.target.value)}
                disabled={stillLive}
                className="rounded-lg border-slate-200 disabled:opacity-40"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={stillLive}
              onChange={(e) => setStillLive(e.target.checked)}
              className="accent-primary h-4 w-4 rounded border-slate-300"
            />
            I still live here
          </label>

          <div className="space-y-1.5">
            <Label className="text-slate-700">
              Monthly rent <span className="text-xs font-normal text-slate-400">(optional)</span>
            </Label>
            <div className="relative max-w-[200px]">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>
              <Input
                type="number"
                placeholder="1500"
                min={0}
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="rounded-lg border-slate-200 pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">
              Lease type <span className="text-xs font-normal text-slate-400">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {LEASE_TYPES.map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setLeaseType(lt === leaseType ? '' : lt)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                    leaseType === lt
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
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
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900">
              Rate this property
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All scores are required (1 = very poor, 5 = excellent).
            </p>
          </div>
          <div className="space-y-6">
            {SCORE_FIELDS.map((f) => (
              <ScoreSelector
                key={f.name}
                name={f.name}
                label={f.label}
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
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900">
              Write your review
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Share your experience honestly. Your identity will never be revealed.
            </p>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What was living here actually like? Describe the landlord, maintenance, neighbors, building condition…"
            rows={8}
            maxLength={2000}
            className="focus:ring-primary/20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${body.length < 50 ? 'text-slate-400' : 'text-green-600'}`}>
              {body.length < 50 ? `${50 - body.length} more characters needed` : 'Good to go'}
            </span>
            <span className={`text-xs ${body.length > 1800 ? 'text-amber-500' : 'text-slate-400'}`}>
              {body.length} / 2000
            </span>
          </div>

          {coachSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="bg-primary rounded px-1.5 py-0.5 font-[family-name:var(--font-poppins)] text-[10px] font-black tracking-wider text-white uppercase">
                  AI
                </span>
                Writing suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {coachSuggestions.map((s) => (
                  <div
                    key={s}
                    className="border-primary/20 bg-primary/5 text-primary flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedSuggestions((prev) => new Set([...prev, s]))
                        setCoachSuggestions((prev) => prev.filter((x) => x !== s))
                      }}
                      className="text-primary/40 hover:text-primary transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Guidelines</p>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-400">
              <li>Be honest and specific about your experience</li>
              <li>Avoid personal information (yours or others&apos;)</li>
              <li>No hate speech or discriminatory language</li>
              <li>Your review always appears as Anonymous Tenant</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 4 — Would rent again */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900">
              One last thing
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-800">Would you rent here again?</p>
            <p className="text-xs text-slate-400">Optional — but helps future renters a lot.</p>
            <div className="flex gap-3">
              {(['yes', 'no'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWouldRentAgain(wouldRentAgain === val ? null : val)}
                  className={`rounded-full border-2 px-6 py-2 text-sm font-medium transition-all ${
                    wouldRentAgain === val
                      ? val === 'yes'
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-red-400 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {val === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Your privacy is protected</p>
            <p className="mt-1 text-xs text-slate-500">
              Your review will appear as &ldquo;Anonymous Tenant&rdquo;. Your name, email, and
              account are never visible to anyone.
            </p>
          </div>
        </div>
      )}

      {/* Step 5 — Preview + submit */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900">
              Preview your review
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This is exactly how your review will appear — always as{' '}
              <span className="font-medium text-slate-700">Anonymous Tenant</span>.
            </p>
          </div>

          {/* Preview card — matches review-list.tsx design */}
          <div
            className={`rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm ${borderClass(scores.score_overall)}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${scoreBadgeClass(scores.score_overall)}`}
                >
                  {scores.score_overall}/5
                </span>
                {wouldRentAgain !== null && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${wouldRentAgain === 'yes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
                  >
                    {wouldRentAgain === 'yes' ? 'Would rent again' : 'Would not rent again'}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                Anonymous Tenant ·{' '}
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {(moveInYear || rentAmount) && (
              <p className="mb-3 text-xs text-slate-400">
                {moveInYear && (
                  <>
                    {moveInYear}
                    {stillLive ? '–present' : moveOutYear ? `–${moveOutYear}` : ''}
                  </>
                )}
                {rentAmount && moveInYear && ' · '}
                {rentAmount && `$${Number(rentAmount).toLocaleString()}/mo`}
                {leaseType && ` · ${leaseType}`}
              </p>
            )}

            <p className="text-sm leading-relaxed text-slate-700">&ldquo;{body}&rdquo;</p>

            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
              {SCORE_FIELDS.slice(1).map((f) => (
                <div key={f.name} className="text-center">
                  <span className="mb-0.5 block text-xs text-slate-400">{f.short}</span>
                  <span
                    className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-bold ${scoreBadgeClass(scores[f.name])}`}
                  >
                    {scores[f.name]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <form action={formAction}>
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
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => (step === 1 ? router.back() : setStep((s) => s - 1))}
          className="text-sm text-slate-400 transition-colors hover:text-slate-700"
        >
          {step === 1 ? (
            'Cancel'
          ) : (
            <span className="inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </span>
          )}
        </button>

        {step < TOTAL_STEPS && (
          <Button
            type="button"
            disabled={!canAdvance()}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full px-6"
          >
            <span className="inline-flex items-center gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
