import * as Yup from 'yup';

export const clientInfoSchema = Yup.object().shape({
  accountManager: Yup.string().required('Account Manager is required'),
  outputName: Yup.string()
    .required('Output file name is required')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens are allowed'),
  folderUrl: Yup.string().required('Output folder location is required')
});

export const clientDetailsSchema = Yup.object().shape({
  clientName: Yup.string().required('Client name is required'),
  clientEmail: Yup.string()
    .email('Invalid email address')
    .required('Client email is required'),
  clientPhone: Yup.string()
    .matches(/^[0-9-+() ]+$/, 'Invalid phone number')
    .required('Client phone is required'),
  clientWebsite: Yup.string()
    .url('Invalid website URL')
    .required('Client website is required')
});

export const appInfoSchema = Yup.object().shape({
  appName: Yup.string().required('App name is required'),
  appBundleId: Yup.string()
    .required('App bundle ID is required')
    .matches(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/, 'Invalid bundle ID format'),
  appStoreUrl: Yup.string()
    .url('Invalid App Store URL')
    .required('App Store URL is required'),
  playStoreUrl: Yup.string()
    .url('Invalid Play Store URL')
    .required('Play Store URL is required'),
  appDescription: Yup.string()
    .required('App description is required')
    .min(10, 'Description must be at least 10 characters')
});

export const eventSchema = Yup.object().shape({
  eventName: Yup.string().required('Event name is required'),
  eventType: Yup.string().required('Event type is required'),
  eventValue: Yup.string(),
  isIAP: Yup.boolean()
});

export const campaignSchema = Yup.object().shape({
  campaignName: Yup.string().required('Campaign name is required'),
  campaignStartDate: Yup.date()
    .required('Start date is required')
    .max(Yup.ref('campaignEndDate'), 'Start date must be before end date'),
  campaignEndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('campaignStartDate'), 'End date must be after start date'),
  campaignBudget: Yup.number()
    .required('Campaign budget is required')
    .positive('Budget must be positive')
});

export const offerSchema = Yup.object().shape({
  offerName: Yup.string().required('Offer name is required'),
  offerType: Yup.string().required('Offer type is required'),
  offerValue: Yup.string(),
  offerDescription: Yup.string()
    .required('Offer description is required')
    .min(10, 'Description must be at least 10 characters')
}); 