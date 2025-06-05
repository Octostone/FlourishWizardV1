import { Grid, TextField } from '@mui/material';
import { Formik, Form } from 'formik';
import { useWizard } from '../../context/WizardContext';
import { appInfoSchema } from '../../validation/schemas';

export default function AppInformation() {
  const { formData, updateFormData } = useWizard();
  const { appName, appBundleId, appStoreUrl, playStoreUrl, appDescription } = formData;

  const initialValues = {
    appName,
    appBundleId,
    appStoreUrl,
    playStoreUrl,
    appDescription
  };

  const handleSubmit = (values) => {
    updateFormData('appInfo', values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={appInfoSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="App Name"
                name="appName"
                value={values.appName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.appName && Boolean(errors.appName)}
                helperText={touched.appName && errors.appName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="App Bundle ID"
                name="appBundleId"
                value={values.appBundleId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.appBundleId && Boolean(errors.appBundleId)}
                helperText={touched.appBundleId && errors.appBundleId}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="App Store URL"
                name="appStoreUrl"
                value={values.appStoreUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.appStoreUrl && Boolean(errors.appStoreUrl)}
                helperText={touched.appStoreUrl && errors.appStoreUrl}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Play Store URL"
                name="playStoreUrl"
                value={values.playStoreUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.playStoreUrl && Boolean(errors.playStoreUrl)}
                helperText={touched.playStoreUrl && errors.playStoreUrl}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="App Description"
                name="appDescription"
                value={values.appDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.appDescription && Boolean(errors.appDescription)}
                helperText={touched.appDescription && errors.appDescription}
                multiline
                rows={4}
                required
              />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
} 