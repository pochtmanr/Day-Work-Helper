export const tagColors: { [key: string]: string } = {
  'new chat': 'bg-blue-200',
  'closing': 'bg-green-200',
  'pause': 'bg-yellow-200',
  'collecting assets': 'bg-red-200',
  'self serve': 'bg-purple-200',
  'MPS transfer': 'bg-pink-200',
  'call permission': 'bg-indigo-200',
  'no response': 'bg-teal-200',
  'other': 'bg-gray-200',
  'pixel': 'bg-blue-200',
  'whatsapp': 'bg-green-200',
  'instagram': 'bg-purple-200',
  'ads-manager': 'bg-orange-200',
  'facebook': 'bg-indigo-200',
  'messenger': 'bg-pink-200',
  'business-manager': 'bg-teal-200',
  'commerce-manager': 'bg-red-200',
}

export function getTagColor(tag: string): string {
  console.log(tag)
  console.log(tagColors[tag])
  return tagColors[tag] || 'bg-gray-200'
}
