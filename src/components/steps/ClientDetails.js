import { Grid, TextField } from '@mui/material';
import { Formik, Form } from 'formik';
import { useWizard } from '../../context/WizardContext';
import { clientDetailsSchema } from '../../validation/schemas';

export default function ClientBasics() {
  const { formData, updateFormData } = useWizard();
  const { clientName, clientEmail, clientPhone, clientWebsite } = formData;

  const initialValues = {
    clientName,
    clientEmail,
    clientPhone,
    clientWebsite
  };

  const handleSubmit = (values) => {
    updateFormData('clientDetails', values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={clientDetailsSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                name="clientName"
                value={values.clientName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.clientName && Boolean(errors.clientName)}
                helperText={touched.clientName && errors.clientName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Email"
                name="clientEmail"
                type="email"
                value={values.clientEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.clientEmail && Boolean(errors.clientEmail)}
                helperText={touched.clientEmail && errors.clientEmail}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Phone"
                name="clientPhone"
                value={values.clientPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.clientPhone && Boolean(errors.clientPhone)}
                helperText={touched.clientPhone && errors.clientPhone}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Website"
                name="clientWebsite"
                value={values.clientWebsite}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.clientWebsite && Boolean(errors.clientWebsite)}
                helperText={touched.clientWebsite && errors.clientWebsite}
                required
              />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
} 