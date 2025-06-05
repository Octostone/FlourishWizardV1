import { Grid, TextField, Button, Alert } from '@mui/material';
import { Formik, Form } from 'formik';
import { useWizard } from '../../context/WizardContext';
import { clientInfoSchema } from '../../validation/schemas';

export default function ClientInfo() {
  const { formData, updateFormData } = useWizard();
  const { accountManager, outputName, folderUrl } = formData;

  const initialValues = {
    accountManager,
    outputName,
    folderUrl
  };

  const handleSubmit = (values) => {
    // Extract folder ID from URL
    const folderId = values.folderUrl.split('/folders/')[1]?.split('?')[0];
    if (!folderId) {
      throw new Error('Invalid Google Drive folder URL');
    }

    updateFormData('clientInfo', {
      ...values,
      folderId
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={clientInfoSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Manager"
                name="accountManager"
                value={values.accountManager}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.accountManager && Boolean(errors.accountManager)}
                helperText={touched.accountManager && errors.accountManager}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Output Name"
                name="outputName"
                value={values.outputName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.outputName && Boolean(errors.outputName)}
                helperText={touched.outputName && errors.outputName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Google Drive Folder URL"
                name="folderUrl"
                value={values.folderUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.folderUrl && Boolean(errors.folderUrl)}
                helperText={
                  (touched.folderUrl && errors.folderUrl) ||
                  'Paste the URL of your Google Drive folder here'
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                To get your Google Drive folder URL:
                <ol>
                  <li>Open Google Drive</li>
                  <li>Navigate to the folder where you want to store the template and images</li>
                  <li>Click the "Share" button</li>
                  <li>Copy the folder URL from your browser's address bar</li>
                </ol>
              </Alert>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
} 