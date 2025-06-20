import { createContext, useContext, useState, useCallback } from 'react';

const WizardContext = createContext();

export function WizardProvider({ children }) {
  const initialFormData = {
    // Shared fields across pages
    accountManager: '',
    flourishClientName: '',
    geo: '',
    
    // Client Info
    outputName: '',
    folderId: '', // Google Drive folder ID
    folderUrl: '', // Google Drive folder URL
    
    // Client Details
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientWebsite: '',
    
    // App Information
    appName: '',
    appBundleId: '',
    appStoreUrl: '',
    playStoreUrl: '',
    appDescription: '',
    
    // Events
    events: [],
    
    // Campaign
    campaignName: '',
    campaignStartDate: '',
    campaignEndDate: '',
    campaignBudget: '',
    
    // Offers
    offers: [],
    
    // Images
    iconImage: null,
    carouselImage: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeStep, setActiveStep] = useState(0);

  // Row index state for each single-row tab
  const [clientBasicsRowIndex, setClientBasicsRowIndex] = useState(null);
  const [clientDetailsRowIndex, setClientDetailsRowIndex] = useState(null);
  const [appInfoRowIndex, setAppInfoRowIndex] = useState(null);
  const [campaignRowIndex, setCampaignRowIndex] = useState(null);

  // Helper to update shared fields
  const updateSharedField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Helper to get shared field value
  const getSharedField = useCallback((field) => {
    return formData[field] || '';
  }, [formData]);

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const addEvent = (event) => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));
  };

  const removeEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const addOffer = (offer) => {
    setFormData(prev => ({
      ...prev,
      offers: [...prev.offers, offer]
    }));
  };

  const removeOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));
  };

  const resetWizard = () => {
    setFormData(initialFormData);
    setActiveStep(0);
    setClientBasicsRowIndex(null);
    setClientDetailsRowIndex(null);
    setAppInfoRowIndex(null);
    setCampaignRowIndex(null);
  };

  return (
    <WizardContext.Provider value={{
      formData,
      updateFormData,
      updateSharedField,
      getSharedField,
      addEvent,
      removeEvent,
      addOffer,
      removeOffer,
      activeStep,
      setActiveStep,
      // Row index state and setters
      clientBasicsRowIndex,
      setClientBasicsRowIndex,
      clientDetailsRowIndex,
      setClientDetailsRowIndex,
      appInfoRowIndex,
      setAppInfoRowIndex,
      campaignRowIndex,
      setCampaignRowIndex,
      resetWizard
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
} 