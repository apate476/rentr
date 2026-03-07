type ReviewData = {
  body: string
  score_overall: number
  score_value: number
  score_landlord: number
  score_noise: number
  score_pests: number
  score_safety: number
  score_parking: number
  score_pets: number
  score_neighborhood: number
  would_rent_again: boolean | null
  move_in_year: number | null
  move_out_year: number | null
  created_at: string
}

export function buildSummaryPrompt(reviews: ReviewData[]): string {
  const formatted = reviews
    .map((r, i) => {
      const tenure = r.move_in_year
        ? `${r.move_in_year}${r.move_out_year ? `–${r.move_out_year}` : '–present'}`
        : 'unknown tenure'
      const wra =
        r.would_rent_again === true
          ? ', would rent again'
          : r.would_rent_again === false
            ? ', would NOT rent again'
            : ''
      return `Review ${i + 1} (${tenure}${wra}):
Scores: overall=${r.score_overall}, value=${r.score_value}, landlord=${r.score_landlord}, noise=${r.score_noise}, pests=${r.score_pests}, safety=${r.score_safety}, parking=${r.score_parking}, pets=${r.score_pets}, neighborhood=${r.score_neighborhood}
"${r.body}"`
    })
    .join('\n\n')

  return `You are summarizing tenant reviews for a rental property. Based on the following ${reviews.length} review(s), extract key patterns.

${formatted}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "praised": ["up to 4 short phrases describing what reviewers consistently praised"],
  "issues": ["up to 4 short phrases describing what reviewers consistently complained about"],
  "trend": "one sentence about any notable trend or change over time, or null if not enough data"
}

Be specific and concrete. Use the actual review content, not generic statements.`
}

export function buildChatSystemPrompt(
  propertyContext: {
    address: string
    city: string
    state: string
    reviews: ReviewData[]
  } | null
): string {
  if (propertyContext) {
    const { address, city, state, reviews } = propertyContext
    const reviewSummaries = reviews
      .slice(0, 15)
      .map((r, i) => {
        const wra =
          r.would_rent_again === true
            ? ' (would rent again)'
            : r.would_rent_again === false
              ? ' (would NOT rent again)'
              : ''
        return `Review ${i + 1}${wra}: overall ${r.score_overall}/5, landlord ${r.score_landlord}/5, noise ${r.score_noise}/5, pests ${r.score_pests}/5, safety ${r.score_safety}/5
"${r.body.slice(0, 300)}${r.body.length > 300 ? '…' : ''}"`
      })
      .join('\n\n')

    return `You are a helpful assistant on Rentr, a rental review platform. You have access to ${reviews.length} anonymous tenant review(s) for ${address}, ${city}, ${state}.

Answer questions about this property based ONLY on what reviewers have reported. Be specific and cite review patterns. If something isn't mentioned in the reviews, say so. Keep responses concise (2-4 sentences unless more is needed).

REVIEWS:
${reviewSummaries}`
  }

  return `You are a helpful renter advisor on Rentr, a rental review platform. Help users make smart rental decisions. You can:
- Explain what to look for in a rental property
- Help interpret property scores and review patterns
- Give general advice about renting (leases, landlord communication, red flags)
- Help users think through their priorities

Keep responses practical, concise, and actionable. Don't make up specific property data.`
}

export function buildWritingCoachPrompt(
  body: string,
  scores: Record<string, number | null>
): string {
  const lowScores = Object.entries(scores)
    .filter(([, v]) => v !== null && v <= 2)
    .map(([k]) => k.replace('score_', ''))

  return `A renter is writing a property review. Suggest 1-2 specific follow-up questions to make their review more useful.

Their current draft: "${body.slice(0, 500)}"
${lowScores.length > 0 ? `They rated these categories poorly (1-2/5): ${lowScores.join(', ')}` : ''}

Respond with ONLY a JSON array of 1-2 short follow-up questions (max 12 words each) that would make the review more helpful to future renters.
Example: ["You rated noise 2/5 — what specifically caused it?", "How quickly did management respond to issues?"]

Focus on their low scores or gaps in the review. Be direct and specific.`
}
