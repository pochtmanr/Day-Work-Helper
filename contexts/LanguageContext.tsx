'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

type Language = 'en' | 'he'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    'Welcome to Day Work Helper': 'Welcome to Day Work Helper',
    'Day Work Helper': 'Day Work Helper',
    home: 'Home',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    chatTemplates: 'Chat Templates',
    emailTemplates: 'Email Templates',
    caseResolutions: 'Case Resolutions',
    logout: 'Logout',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    updateName: 'Update Name',
    changePassword: 'Change Password',
    resetPassword: 'Reset Password',
    deleteAccount: 'Delete Account',
    userTag: 'User Tag',
    language: 'Language',
    english: 'English',
    hebrew: 'Hebrew',
    save: 'Save',
    cancel: 'Cancel',
    'Enter your email': 'Enter your email',
    'Enter your password': 'Enter your password',
    'Enter your password (min. 6 characters)': 'Enter your password (min. 6 characters)',
    'I accept the': 'I accept the',
    'Terms of Service': 'Terms of Service',
    'Logging in...': 'Logging in...',
    'Login with Facebook': 'Login with Facebook',
    'Processing...': 'Processing...',
    "Don't have an account?": "Don't have an account?",
    'Register here': 'Register here',
    'Already have an account?': 'Already have an account?',
    'Login here': 'Login here',
    'Creating account...': 'Creating account...',
    'Register with Facebook': 'Register with Facebook',
    'Validation Error': 'Validation Error',
    'Please enter your email.': 'Please enter your email.',
    'Password must be at least 6 characters long.': 'Password must be at least 6 characters long.',
    'You must accept the Terms of Service to log in.': 'You must accept the Terms of Service to log in.',
    'Login Successful': 'Login Successful',
    'You have been logged in successfully.': 'You have been logged in successfully.',
    'Login Failed': 'Login Failed',
    'Invalid email or password. Please try again.': 'Invalid email or password. Please try again.',
    'You have been logged in with Facebook successfully.': 'You have been logged in with Facebook successfully.',
    'Failed to login with Facebook. Please try again.': 'Failed to login with Facebook. Please try again.',
    'Registration Successful': 'Registration Successful',
    'Your account has been created successfully.': 'Your account has been created successfully.',
    'Failed to create account. Please try again.': 'Failed to create account. Please try again.',
    'This email is already registered. Please try logging in.': 'This email is already registered. Please try logging in.',
    'Invalid email address. Please check and try again.': 'Invalid email address. Please check and try again.',
    'Password is too weak. Please use a stronger password.': 'Password is too weak. Please use a stronger password.',
    'Permission denied. Please check your account permissions or try again later.': 'Permission denied. Please check your account permissions or try again later.',
    'Registration Failed': 'Registration Failed',
    'Your account has been created with Facebook successfully.': 'Your account has been created with Facebook successfully.',
    'Failed to register with Facebook. Please try again.': 'Failed to register with Facebook. Please try again.',
    'Dashboard': 'Dashboard',
    'Profile Settings': 'Profile Settings',
    'No Photo': 'No Photo',
    'Updating...': 'Updating...',
    'Select a tag': 'Select a tag',
    'Select a language': 'Select a language',
    'Changing...': 'Changing...',
    'Are you sure you want to delete your account? This action cannot be undone.': 'Are you sure you want to delete your account? This action cannot be undone.',
    'Account Deleted': 'Account Deleted',
    'Your account has been deleted successfully.': 'Your account has been deleted successfully.',
    'Deletion Failed': 'Deletion Failed',
    'Failed to delete your account. Please try again.': 'Failed to delete your account. Please try again.',
    'Logout Failed': 'Logout Failed',
    'Failed to log out. Please try again.': 'Failed to log out. Please try again.',
    'Create Template': 'Create Template',
    'Client Name': 'Client Name',
    'Enter client\'s name': 'Enter client\'s name',
    'Choose gender': 'Choose gender',
    'Male': 'Male',
    'Female': 'Female',
    'Search templates...': 'Search templates...',
    'Filter by tag': 'Filter by tag',
    'All tags': 'All tags',
    'No templates found matching your search criteria.': 'No templates found matching your search criteria.',
    'Subject': 'Subject',
    'Private': 'Private',
    'Copied': 'Copied',
    'Template content has been copied to clipboard.': 'Template content has been copied to clipboard.',
    'Template Deleted': 'Template Deleted',
    'The template has been deleted successfully.': 'The template has been deleted successfully.',
    'Error': 'Error',
    'Failed to delete template. Please try again later.': 'Failed to delete template. Please try again later.',
    'Template Updated': 'Template Updated',
    'The template has been updated successfully.': 'The template has been updated successfully.',
    'Failed to update template. Please try again later.': 'Failed to update template. Please try again later.',
    'Your new template has been created successfully.': 'Your new template has been created successfully.',
    'Failed to create template. Please try again later.': 'Failed to create template. Please try again later.',
    'Create New Template': 'Create New Template',
    'Create a new template. Click save when you\'re done.': 'Create a new template. Click save when you\'re done.',
    'Male Content': 'Male Content',
    'Female Content': 'Female Content',
    'Private template': 'Private template',
    'Creating...': 'Creating...',
    'Edit Template': 'Edit Template',
    'Edit the template. Click save when you\'re done.': 'Edit the template. Click save when you\'re done.',
    'Save Changes': 'Save Changes',
    'New Resolution': 'New Resolution',
    'Create New Case Resolution': 'Create New Case Resolution',
    'Create a new case resolution. Click save when you\'re done.': 'Create a new case resolution. Click save when you\'re done.',
    'Title': 'Title',
    'Issue Description': 'Issue Description',
    'Resolution Steps': 'Resolution Steps',
    'Add Step': 'Add Step',
    'Describe this step...': 'Describe this step...',
    'Images': 'Images',
    'Publish resolution': 'Publish resolution',
    'Creating Resolution...': 'Creating Resolution...',
    'Are you sure?': 'Are you sure?',
    'This action cannot be undone. This will permanently delete the case resolution and all its associated data.': 'This action cannot be undone. This will permanently delete the case resolution and all its associated data.',
    'Delete': 'Delete',
    'Published': 'Published',
    'Step': 'Step',
    'Image Preview': 'Image Preview',
    'Click outside to close': 'Click outside to close',
    'Streamline Your Workflow': 'Streamline Your Workflow',
    'Create, manage, and organize your templates effortlessly with Day Work Helper.': 'Create, manage, and organize your templates effortlessly with Day Work Helper.',
    'Get Started': 'Get Started',
    'Create and manage chat templates for quick responses.': 'Create and manage chat templates for quick responses.',
    'Design professional email templates for various scenarios.': 'Design professional email templates for various scenarios.',
    'Document and share case resolution steps for efficient problem-solving.': 'Document and share case resolution steps for efficient problem-solving.',
    'All rights reserved.': 'All rights reserved.',
    'About Day Work Helper': 'About Day Work Helper',
    'Day Work Helper is a powerful tool designed to streamline your workflow and boost productivity. It offers a suite of features including chat templates, email templates, and case resolution management.': 'Day Work Helper is a powerful tool designed to streamline your workflow and boost productivity. It offers a suite of features including chat templates, email templates, and case resolution management.',
    'Our Mission': 'Our Mission',
    'Our mission is to simplify the daily tasks of professionals, enabling them to focus on what truly matters - delivering exceptional service to their clients.': 'Our mission is to simplify the daily tasks of professionals, enabling them to focus on what truly matters - delivering exceptional service to their clients.',
    'Key Features': 'Key Features',
    'Customizable chat templates': 'Customizable chat templates',
    'Professional email templates': 'Professional email templates',
    'Efficient case resolution management': 'Efficient case resolution management',
    'Multi-language support': 'Multi-language support',
    'Creator': 'Creator',
    'Day Work Helper was created and designed by Roman Pochtman in 2025.': 'Day Work Helper was created and designed by Roman Pochtman in 2025.',
    '© 2025 Roman Pochtman. All rights reserved.': '© 2025 Roman Pochtman. All rights reserved.',
    'Return to Home': 'Return to Home',
    'About': 'About',
    'About Us': 'About Us',
  },
  he: {
    'Welcome to Day Work Helper': 'ברוכים הבאים ל-Day Work Helper',
    'Day Work Helper': 'Day Work Helper',
    home: 'בית',
    login: 'התחברות',
    register: 'הרשמה',
    profile: 'פרופיל',
    chatTemplates: 'תבניות צ\'אט',
    emailTemplates: 'תבניות אימייל',
    caseResolutions: 'פתרונות מקרה',
    logout: 'התנתקות',
    name: 'שם',
    email: 'אימייל',
    password: 'סיסמה',
    oldPassword: 'סיסמה ישנה',
    newPassword: 'סיסמה חדשה',
    updateName: 'עדכן שם',
    changePassword: 'שנה סיסמה',
    resetPassword: 'אפס סיסמה',
    deleteAccount: 'מחק חשבון',
    userTag: 'תג משתמש',
    language: 'שפה',
    english: 'אנגלית',
    hebrew: 'עברית',
    save: 'שמור',
    cancel: 'בטל',
    'Enter your email': 'הכנס את האימייל שלך',
    'Enter your password': 'הכנס את הסיסמה שלך',
    'Enter your password (min. 6 characters)': 'הכנס את הסיסמה שלך (מינימום 6 תווים)',
    'I accept the': 'אני מקבל את',
    'Terms of Service': 'תנאי השירות',
    'Logging in...': 'מתחבר...',
    'Login with Facebook': 'התחבר עם פייסבוק',
    'Processing...': 'מעבד...',
    "Don't have an account?": "אין לך חשבון?",
    'Register here': 'הירשם כאן',
    'Already have an account?': 'כבר יש לך חשבון?',
    'Login here': 'התחבר כאן',
    'Creating account...': 'יוצר חשבון...',
    'Register with Facebook': 'הירשם עם פייסבוק',
    'Validation Error': 'שגיאת אימות',
    'Please enter your email.': 'אנא הכנס את האימייל שלך.',
    'Password must be at least 6 characters long.': 'הסיסמה חייבת להיות לפחות 6 תווים.',
    'You must accept the Terms of Service to log in.': 'עליך לקבל את תנאי השירות כדי להתחבר.',
    'Login Successful': 'ההתחברות הצליחה',
    'You have been logged in successfully.': 'התחברת בהצלחה.',
    'Login Failed': 'ההתחברות נכשלה',
    'Invalid email or password. Please try again.': 'אימייל או סיסמה לא תקינים. אנא נסה שוב.',
    'You have been logged in with Facebook successfully.': 'התחברת בהצלחה עם פייסבוק.',
    'Failed to login with Facebook. Please try again.': 'ההתחברות עם פייסבוק נכשלה. אנא נסה שוב.',
    'Registration Successful': 'ההרשמה הצליחה',
    'Your account has been created successfully.': 'החשבון שלך נוצר בהצלחה.',
    'Failed to create account. Please try again.': 'יצירת החשבון נכשלה. אנא נסה שוב.',
    'This email is already registered. Please try logging in.': 'אימייל זה כבר רשום. אנא נסה להתחבר.',
    'Invalid email address. Please check and try again.': 'כתובת אימייל לא תקינה. אנא בדוק ונסה שוב.',
    'Password is too weak. Please use a stronger password.': 'הסיסמה חלשה מדי. אנא השתמש בסיסמה חזקה יותר.',
    'Permission denied. Please check your account permissions or try again later.': 'ההרשאה נדחתה. אנא בדוק את הרשאות החשבון שלך או נסה שוב מאוחר יותר.',
    'Registration Failed': 'ההרשמה נכשלה',
    'Your account has been created with Facebook successfully.': 'החשבון שלך נוצר בהצלחה עם פייסבוק.',
    'Failed to register with Facebook. Please try again.': 'ההרשמה עם פייסבוק נכשלה. אנא נסה שוב.',
    'Dashboard': 'לוח בקרה',
    'Profile Settings': 'הגדרות פרופיל',
    'No Photo': 'אין תמונה',
    'Updating...': 'מעדכן...',
    'Select a tag': 'בחר תג',
    'Select a language': 'בחר שפה',
    'Changing...': 'משנה...',
    'Are you sure you want to delete your account? This action cannot be undone.': 'האם אתה בטוח שברצונך למחוק את חשבונך? פעולה זו אינה ניתנת לביטול.',
    'Account Deleted': 'החשבון נמחק',
    'Your account has been deleted successfully.': 'חשבונך נמחק בהצלחה.',
    'Deletion Failed': 'המחיקה נכשלה',
    'Failed to delete your account. Please try again.': 'מחיקת החשבון נכשלה. אנא נסה שוב.',
    'Logout Failed': 'ההתנתקות נכשלה',
    'Failed to log out. Please try again.': 'ההתנתקות נכשלה. אנא נסה שוב.',
    'Create Template': 'צור תבנית',
    'Client Name': 'שם הלקוח',
    'Enter client\'s name': 'הכנס את שם הלקוח',
    'Choose gender': 'בחר מגדר',
    'Male': 'זכר',
    'Female': 'נקבה',
    'Search templates...': 'חפש תבניות...',
    'Filter by tag': 'סנן לפי תג',
    'All tags': 'כל התגים',
    'No templates found matching your search criteria.': 'לא נמצאו תבניות התואמות לקריטריוני החיפוש שלך.',
    'Subject': 'נושא',
    'Private': 'פרטי',
    'Copied': 'הועתק',
    'Template content has been copied to clipboard.': 'תוכן התבנית הועתק ללוח.',
    'Template Deleted': 'התבנית נמחקה',
    'The template has been deleted successfully.': 'התבנית נמחקה בהצלחה.',
    'Error': 'שגיאה',
    'Failed to delete template. Please try again later.': 'מחיקת התבנית נכשלה. אנא נסה שוב מאוחר יותר.',
    'Template Updated': 'התבנית עודכנה',
    'The template has been updated successfully.': 'התבנית עודכנה בהצלחה.',
    'Failed to update template. Please try again later.': 'עדכון התבנית נכשל. אנא נסה שוב מאוחר יותר.',
    'Your new template has been created successfully.': 'התבנית החדשה שלך נוצרה בהצלחה.',
    'Failed to create template. Please try again later.': 'יצירת התבנית נכשלה. אנא נסה שוב מאוחר יותר.',
    'Create New Template': 'צור תבנית חדשה',
    'Create a new template. Click save when you\'re done.': 'צור תבנית חדשה. לחץ על שמור כשתסיים.',
    'Male Content': 'תוכן לזכר',
    'Female Content': 'תוכן לנקבה',
    'Private template': 'תבנית פרטית',
    'Creating...': 'יוצר...',
    'Edit Template': 'ערוך תבנית',
    'Edit the template. Click save when you\'re done.': 'ערוך את התבנית. לחץ על שמור כשתסיים.',
    'Save Changes': 'שמור שינויים',
    'New Resolution': 'פתרון חדש',
    'Case Resolutions': 'פתרונות מקרה',
    'Create New Case Resolution': 'צור פתרון מקרה חדש',
    'Create a new case resolution. Click save when you\'re done.': 'צור פתרון מקרה חדש. לחץ על שמור כשתסיים.',
    'Title': 'כותרת',
    'Issue Description': 'תיאור הבעיה',
    'Resolution Steps': 'שלבי הפתרון',
    'Add Step': 'הוסף שלב',
    'Describe this step...': 'תאר שלב זה...',
    'Images': 'תמונות',
    'Publish resolution': 'פרסם פתרון',
    'Creating Resolution...': 'יוצר פתרון...',
    'Are you sure?': 'האם אתה בטוח?',
    'This action cannot be undone. This will permanently delete the case resolution and all its associated data.': 'פעולה זו אינה ניתנת לביטול. היא תמחק לצמיתות את פתרון המקרה וכל הנתונים הקשורים אליו.',
    'Delete': 'מחק',
    'Published': 'פורסם',
    'Step': 'שלב',
    'Image Preview': 'תצוגה מקדימה של תמונה',
    'Click outside to close': 'לחץ מחוץ לחלון כדי לסגור',
    'Streamline Your Workflow': 'ייעל את זרימת העבודה שלך',
    'Create, manage, and organize your templates effortlessly with Day Work Helper.': 'צור, נהל וארגן את התבניות שלך בקלות עם Day Work Helper.',
    'Get Started': 'התחל עכשיו',
    'Create and manage chat templates for quick responses.': 'צור ונהל תבניות צ\'אט לתגובות מהירות.',
    'Design professional email templates for various scenarios.': 'עצב תבניות אימייל מקצועיות לתרחישים שונים.',
    'Document and share case resolution steps for efficient problem-solving.': 'תעד ושתף שלבי פתרון מקרה לפתרון בעיות יעיל.',
    'All rights reserved.': 'כל הזכויות שמורות.',
    'About Day Work Helper': 'אודות Day Work Helper',
    'Day Work Helper is a powerful tool designed to streamline your workflow and boost productivity. It offers a suite of features including chat templates, email templates, and case resolution management.': 'Day Work Helper היא כלי רב עוצמה שנועד לייעל את זרימת העבודה שלך ולהגביר את הפרודוקטיביות. היא מציעה חבילה של תכונות, כולל תבניות צ\'אט, תבניות אימייל וניהול פתרונות מקרה.',
    'Our Mission': 'המשימה שלנו',
    'Our mission is to simplify the daily tasks of professionals, enabling them to focus on what truly matters - delivering exceptional service to their clients.': 'המשימה שלנו היא לפשט את המשימות היומיומיות של אנשי מקצוע, ולאפשר להם להתמקד במה שחשוב באמת - מתן שירות מעולה ללקוחות שלהם.',
    'Key Features': 'תכונות עיקריות',
    'Customizable chat templates': 'תבניות צ\'אט ניתנות להתאמה אישית',
    'Professional email templates': 'תבניות אימייל מקצועיות',
    'Efficient case resolution management': 'ניהול יעיל של פתרונות מקרה',
    'Multi-language support': 'תמיכה בשפות מרובות',
    'Creator': 'יוצר',
    'Day Work Helper was created and designed by Roman Pochtman in 2025.': 'Day Work Helper נוצר ועוצב על ידי רומן פוכטמן בשנת 2025.',
    '© 2025 Roman Pochtman. All rights reserved.': '© 2025 רומן פוכטמן. כל הזכויות שמורות.',
    'Return to Home': 'חזור לדף הבית',
    'About': 'אודות',
    'About Us': 'אודותינו',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr'
  }, [language])

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

