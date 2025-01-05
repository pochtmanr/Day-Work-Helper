export const tagColors: { [key: string]: string } = {
  'onboarding': 'bg-blue-200',
  'support': 'bg-green-200',
  'feedback': 'bg-yellow-200',
  'billing': 'bg-red-200',
  'technical': 'bg-purple-200',
  'account': 'bg-pink-200',
  'security': 'bg-indigo-200',
  'sales': 'bg-teal-200',
  'renewal': 'bg-orange-200',
  'upgrade': 'bg-cyan-200',
  'downgrade': 'bg-lime-200',
  'cancellation': 'bg-amber-200',
  'refund': 'bg-rose-200',
  'complaint': 'bg-fuchsia-200',
  'praise': 'bg-violet-200',
  'query': 'bg-sky-200',
  'resolution': 'bg-emerald-200',
  'escalation': 'bg-amber-300',
  'follow-up': 'bg-blue-300',
  'reminder': 'bg-green-300',
  'notification': 'bg-yellow-300',
  'alert': 'bg-red-300',
  'announcement': 'bg-purple-300',
  'update': 'bg-pink-300',
  'maintenance': 'bg-indigo-300',
  'outage': 'bg-teal-300',
  'service': 'bg-orange-300',
  'availability': 'bg-cyan-300',
  'performance': 'bg-lime-300',
  'optimization': 'bg-rose-300',
}

export function getTagColor(tag: string): string {
  return tagColors[tag] || 'bg-gray-200'
}

