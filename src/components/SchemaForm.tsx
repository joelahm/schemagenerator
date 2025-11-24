import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import { EntityType, LocationType } from '@/context/SchemaContext';
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';

interface SchemaFormProps {
  entityType: EntityType;
  locationType: LocationType;
  onDataChange: (data: any) => void;
}

const SchemaForm = ({ entityType, locationType, onDataChange }: SchemaFormProps) => {
  const [formData, setFormData] = useState<any>({});
  const [customClinicType, setCustomClinicType] = useState<string>('');
  const [showCustomClinicType, setShowCustomClinicType] = useState<boolean>(false);

  const isPractitioner = entityType === 'practitioner';
  const isMultiple = locationType === 'multiple';

  useEffect(() => {
    // Initialize form based on schema type
    const initialData: any = {
      name: '',
      url: '',
      telephone: '',
      sameAs: [''],
    };

    if (isPractitioner) {
      initialData.honorificSuffix = '';
      initialData.jobTitle = '';
      
      if (isMultiple) {
        initialData.worksFor = [{
          name: '',
          url: '',
          telephone: '',
          streetAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          latitude: '',
          longitude: '',
          openingHours: [{
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00'
          }]
        }];
        // Shared services for all locations
        initialData.services = [''];
      } else {
        initialData.worksFor = {
          name: '',
          url: '',
          telephone: '',
          streetAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          latitude: '',
          longitude: '',
          openingHours: [{
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00'
          }],
          services: ['']
        };
      }
      initialData.reviews = [{
        ratingValue: '',
        author: ''
      }];
    } else {
      // Clinic
      initialData.clinicTypes = ['Private Healthcare']; // Default type
      initialData.isCustomClinicName = false;
      initialData.description = '';
      initialData.email = '';
      initialData.priceRange = '';
      initialData.logo = '';
      initialData.image = '';
      initialData.hasMap = '';
      initialData.streetAddress = '';
      initialData.city = '';
      initialData.region = '';
      initialData.postalCode = '';
      initialData.country = '';
      initialData.latitude = '';
      initialData.longitude = '';
      initialData.openingHours = [{
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }];
      initialData.services = [''];
      initialData.ratingValue = '';
      initialData.reviewCount = '';

      if (isMultiple) {
        initialData.subOrganizations = [{
          type: ['Private Healthcare'],
          hasMap: '',
          streetAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          latitude: '',
          longitude: '',
          openingHours: [{
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00'
          }]
        }];
        initialData.reviews = [{
          ratingValue: '',
          author: ''
        }];
      }
    }

    setFormData(initialData);
  }, [entityType, locationType, isPractitioner, isMultiple]);

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => i === index ? value : item)
    }));
  };

  const updateArrayItemField = (field: string, index: number, itemField: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? { ...item, [itemField]: value } : item
      )
    }));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderOpeningHours = (hours: any[], parentField: string, parentIndex?: number) => {
    const updateHours = (index: number, field: string, value: any) => {
      if (parentIndex !== undefined) {
        const newHours = [...hours];
        newHours[index] = { ...newHours[index], [field]: value };
        updateArrayItemField(parentField, parentIndex, 'openingHours', newHours);
      } else {
        const newHours = [...hours];
        newHours[index] = { ...newHours[index], [field]: value };
        if (parentField === 'openingHours') {
          updateField('openingHours', newHours);
        } else {
          updateNestedField(parentField, 'openingHours', newHours);
        }
      }
    };

    const addHours = () => {
      const newHour = { days: [], opens: '09:00', closes: '18:00' };
      if (parentIndex !== undefined) {
        const newHours = [...hours, newHour];
        updateArrayItemField(parentField, parentIndex, 'openingHours', newHours);
      } else {
        if (parentField === 'openingHours') {
          addArrayItem('openingHours', newHour);
        } else {
          const newHours = [...(hours || []), newHour];
          updateNestedField(parentField, 'openingHours', newHours);
        }
      }
    };

    const removeHours = (index: number) => {
      if (parentIndex !== undefined) {
        const newHours = hours.filter((_: any, i: number) => i !== index);
        updateArrayItemField(parentField, parentIndex, 'openingHours', newHours);
      } else {
        if (parentField === 'openingHours') {
          removeArrayItem('openingHours', index);
        } else {
          const newHours = hours.filter((_: any, i: number) => i !== index);
          updateNestedField(parentField, 'openingHours', newHours);
        }
      }
    };

    const toggleDay = (hourIndex: number, day: string) => {
      const hour = hours[hourIndex];
      let days;
      if (hour.days.includes(day)) {
        days = hour.days.filter((d: string) => d !== day);
      } else {
        days = [...hour.days, day];
        // Sort days according to daysOfWeek order
        days.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      }
      updateHours(hourIndex, 'days', days);
    };

    return (
      <div className="space-y-4">
        {hours?.map((hour: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opening Hours Set {index + 1}</Label>
              {hours.length > 1 && (
                <Button
                  onClick={() => removeHours(index)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Days of Week</Label>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      checked={hour.days?.includes(day) || false}
                      onCheckedChange={() => toggleDay(index, day)}
                    />
                    <Label className="text-sm font-normal cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opens</Label>
                <Input
                  type="time"
                  value={hour.opens || ''}
                  onChange={(e) => updateHours(index, 'opens', e.target.value)}
                />
              </div>
              <div>
                <Label>Closes</Label>
                <Input
                  type="time"
                  value={hour.closes || ''}
                  onChange={(e) => updateHours(index, 'closes', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button onClick={addHours} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Opening Hours
        </Button>
      </div>
    );
  };

  const renderServices = (services: string[], parentField: string, parentIndex?: number) => {
    const updateService = (index: number, value: string) => {
      if (parentIndex !== undefined) {
        const newServices = [...services];
        newServices[index] = value;
        updateArrayItemField(parentField, parentIndex, 'services', newServices);
      } else {
        if (parentField === 'services') {
          updateArrayItem('services', index, value);
        } else {
          const newServices = [...services];
          newServices[index] = value;
          updateNestedField(parentField, 'services', newServices);
        }
      }
    };

    const addService = () => {
      if (parentIndex !== undefined) {
        updateArrayItemField(parentField, parentIndex, 'services', [...services, '']);
      } else {
        if (parentField === 'services') {
          addArrayItem('services', '');
        } else {
          const newServices = [...(services || []), ''];
          updateNestedField(parentField, 'services', newServices);
        }
      }
    };

    const removeService = (index: number) => {
      if (parentIndex !== undefined) {
        const newServices = services.filter((_: any, i: number) => i !== index);
        updateArrayItemField(parentField, parentIndex, 'services', newServices);
      } else {
        if (parentField === 'services') {
          removeArrayItem('services', index);
        } else {
          const newServices = services.filter((_: any, i: number) => i !== index);
          updateNestedField(parentField, 'services', newServices);
        }
      }
    };

    return (
      <div className="space-y-3">
        {services?.map((service: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={service}
              onChange={(e) => updateService(index, e.target.value)}
              placeholder="e.g., Cardiac Consultation"
            />
            {services.length > 1 && (
              <Button
                onClick={() => removeService(index)}
                size="icon"
                variant="ghost"
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button onClick={addService} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
    );
  };

  const handlePlaceSelect = (place: any, parentField: string, index?: number, isRootClinic: boolean = false) => {
    console.log('Place selected:', place);
    
    if (!place.address_components) return;

    const addressComponents: any = {};
    place.address_components.forEach((component: any) => {
      const types = component.types;
      if (types.includes('street_number')) {
        addressComponents.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        addressComponents.route = component.long_name;
      }
      if (types.includes('locality')) {
        addressComponents.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressComponents.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        addressComponents.postalCode = component.long_name;
      }
      if (types.includes('country')) {
        addressComponents.country = component.short_name;
      }
    });

    const streetAddress = [addressComponents.streetNumber, addressComponents.route]
      .filter(Boolean)
      .join(' ');

    const updateLoc = (field: string, value: any) => {
      if (isRootClinic) {
        updateField(field, value);
      } else if (index !== undefined) {
        updateArrayItemField(parentField, index, field, value);
      } else {
        updateNestedField(parentField, field, value);
      }
    };

    updateLoc('streetAddress', streetAddress || '');
    updateLoc('city', addressComponents.city || '');
    updateLoc('region', addressComponents.state || '');
    updateLoc('postalCode', addressComponents.postalCode || '');
    updateLoc('country', addressComponents.country || '');

    // Auto-fill geo coordinates
    if (place.geometry?.location) {
      updateLoc('latitude', place.geometry.location.lat().toString());
      updateLoc('longitude', place.geometry.location.lng().toString());
    }

    // For business searches, auto-fill additional details
    if (place.name && !isRootClinic) {
      updateLoc('name', place.name);
    }
    if (place.formatted_phone_number && !isRootClinic) {
      updateLoc('telephone', place.formatted_phone_number);
    }
    if (place.website && !isRootClinic) {
      updateLoc('url', place.website);
    }
  };

  const renderLocationFields = (location: any, parentField: string, index?: number) => {
    const updateLoc = (field: string, value: any) => {
      if (index !== undefined) {
        updateArrayItemField(parentField, index, field, value);
      } else {
        updateNestedField(parentField, field, value);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Street Address *</Label>
          <GooglePlacesAutocomplete
            value={location?.streetAddress || ''}
            onChange={(value) => updateLoc('streetAddress', value)}
            onPlaceSelect={(place) => handlePlaceSelect(place, parentField, index)}
            placeholder="10 Harley Street"
            enableBusinessSearch={true}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City *</Label>
            <Input
              value={location?.city || ''}
              onChange={(e) => updateLoc('city', e.target.value)}
              placeholder="London"
            />
          </div>
          <div>
            <Label>Region *</Label>
            <Input
              value={location?.region || ''}
              onChange={(e) => updateLoc('region', e.target.value)}
              placeholder="England"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Postal Code</Label>
            <Input
              value={location?.postalCode || ''}
              onChange={(e) => updateLoc('postalCode', e.target.value)}
              placeholder="W1G 9PF"
            />
          </div>
          <div>
            <Label>Country Code *</Label>
            <Input
              value={location?.country || ''}
              onChange={(e) => updateLoc('country', e.target.value)}
              placeholder="GB"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Latitude</Label>
            <Input
              value={location?.latitude || ''}
              onChange={(e) => updateLoc('latitude', e.target.value)}
              placeholder="51.5237"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input
              value={location?.longitude || ''}
              onChange={(e) => updateLoc('longitude', e.target.value)}
              placeholder="-0.1444"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Clinic Name *</Label>
            <Input
              value={location?.name || ''}
              onChange={(e) => updateLoc('name', e.target.value)}
              placeholder="Heart Clinic - Harley Street"
            />
          </div>
          <div>
            <Label>Clinic URL</Label>
            <Input
              value={location?.url || ''}
              onChange={(e) => updateLoc('url', e.target.value)}
              placeholder="https://example.com/locations/..."
            />
          </div>
        </div>

        <div>
          <Label>Clinic Phone *</Label>
          <Input
            value={location?.telephone || ''}
            onChange={(e) => updateLoc('telephone', e.target.value)}
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block">Opening Hours</Label>
          {renderOpeningHours(location?.openingHours || [], parentField, index)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{isPractitioner ? 'Practitioner' : 'Clinic'} Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPractitioner && (
            <>
              <div>
                <Label>Clinic Type (@type) *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {(formData.clinicTypes || []).map((type: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {type}
                        <button
                          onClick={() => {
                            updateField('clinicTypes', formData.clinicTypes.filter((_: string, i: number) => i !== index));
                          }}
                          className="ml-2 text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <select
                    className="w-full border rounded-md p-2"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'custom') {
                        setShowCustomClinicType(true);
                      } else if (value && !formData.clinicTypes?.includes(value)) {
                        updateField('clinicTypes', [...(formData.clinicTypes || []), value]);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select clinic type...</option>
                    <option value="Private Healthcare">Private Healthcare</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Primary Care ( GP / Dental Practice)">Primary Care ( GP / Dental Practice)</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Aesthetic Healthcare">Aesthetic Healthcare</option>
                    <option value="Allied Healthcare">Allied Healthcare</option>
                    <option value="custom">Other (Enter custom type)</option>
                  </select>
                  
                  {showCustomClinicType && (
                    <div className="flex gap-2">
                      <Input
                        value={customClinicType}
                        onChange={(e) => setCustomClinicType(e.target.value)}
                        placeholder="Enter custom clinic type"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && customClinicType.trim()) {
                            if (!formData.clinicTypes?.includes(customClinicType.trim())) {
                              updateField('clinicTypes', [...(formData.clinicTypes || []), customClinicType.trim()]);
                            }
                            setCustomClinicType('');
                            setShowCustomClinicType(false);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (customClinicType.trim() && !formData.clinicTypes?.includes(customClinicType.trim())) {
                            updateField('clinicTypes', [...(formData.clinicTypes || []), customClinicType.trim()]);
                          }
                          setCustomClinicType('');
                          setShowCustomClinicType(false);
                        }}
                        size="sm"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setCustomClinicType('');
                          setShowCustomClinicType(false);
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Selected {(formData.clinicTypes?.length || 0)} type(s) - Select at least one
                  </p>
                </div>
              </div>

              <div>
                <Label>Clinic Name *</Label>
                <div className="space-y-2">
                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.name === '' ? '' : (formData.isCustomClinicName ? 'custom' : formData.name)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'custom') {
                        updateField('isCustomClinicName', true);
                        updateField('name', '');
                      } else {
                        updateField('isCustomClinicName', false);
                        updateField('name', value);
                      }
                    }}
                  >
                    <option value="">Select clinic name...</option>
                    <option value="BUPA Healthcare">BUPA Healthcare</option>
                    <option value="Spire Health Care">Spire Health Care</option>
                    <option value="HCA Healthcare">HCA Healthcare</option>
                    <option value="BMI Healthcare">BMI Healthcare</option>
                    <option value="Circle Health Group">Circle Health Group</option>
                    <option value="Practice Plus Group">Practice Plus Group</option>
                    <option value="Cromwell Hospital">Cromwell Hospital</option>
                    <option value="The Harley Street Clinic">The Harley Street Clinic</option>
                    <option value="custom">Other (Enter custom name)</option>
                  </select>
                  
                  {formData.isCustomClinicName && (
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Enter custom clinic name"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {isPractitioner && (
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Dr. John Smith"
              />
            </div>
          )}

          {isPractitioner && (
            <>
              <div>
                <Label>Qualifications (e.g., MBBS, MRCP)</Label>
                <Input
                  value={formData.honorificSuffix || ''}
                  onChange={(e) => updateField('honorificSuffix', e.target.value)}
                  placeholder="MBBS, MRCP"
                />
              </div>
              <div>
                <Label>Job Title *</Label>
                <Input
                  value={formData.jobTitle || ''}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="Consultant Cardiologist"
                />
              </div>
            </>
          )}

          <div>
            <Label>Website URL *</Label>
            <Input
              value={formData.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label>Phone Number (no spaces) *</Label>
            <Input
              value={formData.telephone || ''}
              onChange={(e) => {
                // Remove spaces from input
                const value = e.target.value.replace(/\s/g, '');
                updateField('telephone', value);
              }}
              placeholder="+442012345678"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter phone number without spaces
            </p>
          </div>

          {!isPractitioner && (
            <>
              <div>
                <Label>Description (max 500 characters) *</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      updateField('description', value);
                    }
                  }}
                  placeholder="Brief description of the clinic and services..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {(formData.description || '').length}/500 characters
                </p>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="info@example.com"
                  type="email"
                />
              </div>
              
              <div>
                <Label>Price Range</Label>
                <Input
                  value={formData.priceRange || ''}
                  onChange={(e) => updateField('priceRange', e.target.value)}
                  placeholder="££"
                />
              </div>

              <div>
                <Label>Logo URL</Label>
                <Input
                  value={formData.logo || ''}
                  onChange={(e) => updateField('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  type="url"
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image || ''}
                  onChange={(e) => updateField('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div>
                <Label>Has Map</Label>
                <Input
                  value={formData.hasMap || ''}
                  onChange={(e) => updateField('hasMap', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  type="url"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Professional Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Professional Links</CardTitle>
            <Button
              onClick={() => addArrayItem('sameAs', '')}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.sameAs?.map((link: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={link}
                onChange={(e) => updateArrayItem('sameAs', index, e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
              {formData.sameAs.length > 1 && (
                <Button
                  onClick={() => removeArrayItem('sameAs', index)}
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location/Work Information */}
      {isPractitioner && (
        isMultiple ? (
          // Practitioner - Multiple Locations
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Locations</CardTitle>
                <Button
                  onClick={() => addArrayItem('worksFor', {
                    name: '', url: '', telephone: '', streetAddress: '',
                    city: '', region: '', postalCode: '', country: '',
                    latitude: '', longitude: '',
                    openingHours: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }]
                  })}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.worksFor?.map((location: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Location {index + 1}</h4>
                    {formData.worksFor.length > 1 && (
                      <Button
                        onClick={() => removeArrayItem('worksFor', index)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {renderLocationFields(location, 'worksFor', index)}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          // Practitioner - Single Location
          <Card>
            <CardHeader>
              <CardTitle>Work Location</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLocationFields(formData.worksFor, 'worksFor')}
            </CardContent>
          </Card>
        )
      )}

      {/* Shared Services for Practitioner with Multiple Locations */}
      {isPractitioner && isMultiple && (
        <Card>
          <CardHeader>
            <CardTitle>Available Services (applies to all locations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-lg font-medium mb-3 block">Services</Label>
              {renderServices(formData.services || [], 'services')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services for Single Location Practitioner */}
      {isPractitioner && !isMultiple && (
        <Card>
          <CardHeader>
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-lg font-medium mb-3 block">Services</Label>
              {renderServices(formData.worksFor?.services || [], 'worksFor')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinic */}
      {!isPractitioner && (
        <>
          {!isMultiple && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Street Address *</Label>
                  <GooglePlacesAutocomplete
                    value={formData.streetAddress || ''}
                    onChange={(value) => updateField('streetAddress', value)}
                    onPlaceSelect={(place) => handlePlaceSelect(place, '', undefined, true)}
                    placeholder="100 Beauty Avenue"
                    enableBusinessSearch={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="London"
                    />
                  </div>
                  <div>
                    <Label>Region *</Label>
                    <Input
                      value={formData.region || ''}
                      onChange={(e) => updateField('region', e.target.value)}
                      placeholder="England"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.postalCode || ''}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder="SW1A 1AA"
                    />
                  </div>
                  <div>
                    <Label>Country Code *</Label>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="GB"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      value={formData.latitude || ''}
                      onChange={(e) => updateField('latitude', e.target.value)}
                      placeholder="51.5237"
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      value={formData.longitude || ''}
                      onChange={(e) => updateField('longitude', e.target.value)}
                      placeholder="-0.1444"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opening Hours for Single Clinic */}
          {!isMultiple && (
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {renderOpeningHours(formData.openingHours || [], 'openingHours')}
              </CardContent>
            </Card>
          )}

          {/* Services for Single Clinic */}
          {!isMultiple && (
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
              </CardHeader>
              <CardContent>
                {renderServices(formData.services || [], 'services')}
              </CardContent>
            </Card>
          )}

          {/* Multiple Clinic - Same as Single Location plus Sub-Organizations */}
          {isMultiple && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Street Address *</Label>
                    <GooglePlacesAutocomplete
                      value={formData.streetAddress || ''}
                      onChange={(value) => updateField('streetAddress', value)}
                      onPlaceSelect={(place) => handlePlaceSelect(place, '', undefined, true)}
                      placeholder="100 Beauty Avenue"
                      enableBusinessSearch={true}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="London"
                      />
                    </div>
                    <div>
                      <Label>Region *</Label>
                      <Input
                        value={formData.region || ''}
                        onChange={(e) => updateField('region', e.target.value)}
                        placeholder="England"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={formData.postalCode || ''}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        placeholder="SW1A 1AA"
                      />
                    </div>
                    <div>
                      <Label>Country Code *</Label>
                      <Input
                        value={formData.country || ''}
                        onChange={(e) => updateField('country', e.target.value)}
                        placeholder="GB"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        value={formData.latitude || ''}
                        onChange={(e) => updateField('latitude', e.target.value)}
                        placeholder="51.5237"
                      />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input
                        value={formData.longitude || ''}
                        onChange={(e) => updateField('longitude', e.target.value)}
                        placeholder="-0.1444"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Opening Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderOpeningHours(formData.openingHours || [], 'openingHours')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderServices(formData.services || [], 'services')}
                </CardContent>
              </Card>

              {/* Reviews - Moved before Sub-Organizations for multi-location */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Aggregate Rating</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Average Rating</Label>
                        <Input
                          value={formData.ratingValue || ''}
                          onChange={(e) => updateField('ratingValue', e.target.value)}
                          placeholder="4.8"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                        />
                      </div>
                      <div>
                        <Label>Total Review Count</Label>
                        <Input
                          value={formData.reviewCount || ''}
                          onChange={(e) => updateField('reviewCount', e.target.value)}
                          placeholder="187"
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Additional Locations (Sub-Organizations)</CardTitle>
                <Button
                  onClick={() => addArrayItem('subOrganizations', {
                    name: '',
                    type: ['Physician', 'MedicalClinic'],
                    hasMap: '', streetAddress: '',
                    city: '', region: '', postalCode: '', country: '',
                    latitude: '', longitude: '',
                    openingHours: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }]
                  })}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.subOrganizations?.map((org: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Location {index + 1}</h4>
                        {formData.subOrganizations.length > 1 && (
                          <Button
                            onClick={() => removeArrayItem('subOrganizations', index)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={org.name || ''}
                          onChange={(e) => updateArrayItemField('subOrganizations', index, 'name', e.target.value)}
                          placeholder="Branch Location Name"
                        />
                      </div>
                      
                      <div>
                        <Label>Type (select multiple)</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap mb-2">
                            {(org.type || []).map((type: string, typeIndex: number) => (
                              <Badge key={typeIndex} variant="secondary" className="px-3 py-1">
                                {type}
                                <button
                                  onClick={() => {
                                    const newTypes = org.type.filter((_: string, i: number) => i !== typeIndex);
                                    updateArrayItemField('subOrganizations', index, 'type', newTypes);
                                  }}
                                  className="ml-2 hover:text-destructive"
                                  type="button"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <select
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value && !(org.type || []).includes(value)) {
                                updateArrayItemField('subOrganizations', index, 'type', [...(org.type || []), value]);
                              }
                              e.target.value = '';
                            }}
                            value=""
                          >
                            <option value="">Select type to add...</option>
                            <option value="Physician">Physician</option>
                            <option value="MedicalClinic">MedicalClinic</option>
                            <option value="Dentist">Dentist</option>
                            <option value="MedicalBusiness">MedicalBusiness</option>
                            <option value="HealthAndBeautyBusiness">HealthAndBeautyBusiness</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Has Map</Label>
                        <Input
                          value={org.hasMap || ''}
                          onChange={(e) => updateArrayItemField('subOrganizations', index, 'hasMap', e.target.value)}
                          placeholder="https://maps.google.com/..."
                          type="url"
                        />
                      </div>
                      
                      <div>
                        <Label>Street Address *</Label>
                        <GooglePlacesAutocomplete
                          value={org.streetAddress || ''}
                          onChange={(value) => updateArrayItemField('subOrganizations', index, 'streetAddress', value)}
                          onPlaceSelect={(place) => handlePlaceSelect(place, 'subOrganizations', index)}
                          placeholder="100 Beauty Avenue"
                          enableBusinessSearch={true}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City *</Label>
                          <Input
                            value={org.city || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'city', e.target.value)}
                            placeholder="London"
                          />
                        </div>
                        <div>
                          <Label>Region *</Label>
                          <Input
                            value={org.region || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'region', e.target.value)}
                            placeholder="England"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Postal Code</Label>
                          <Input
                            value={org.postalCode || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'postalCode', e.target.value)}
                            placeholder="SW1A 1AA"
                          />
                        </div>
                        <div>
                          <Label>Country Code *</Label>
                          <Input
                            value={org.country || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'country', e.target.value)}
                            placeholder="GB"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Latitude</Label>
                          <Input
                            value={org.latitude || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'latitude', e.target.value)}
                            placeholder="51.5237"
                          />
                        </div>
                        <div>
                          <Label>Longitude</Label>
                          <Input
                            value={org.longitude || ''}
                            onChange={(e) => updateArrayItemField('subOrganizations', index, 'longitude', e.target.value)}
                            placeholder="-0.1444"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label className="text-lg font-medium mb-3 block">Opening Hours</Label>
                        {renderOpeningHours(org.openingHours || [], 'subOrganizations', index)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Reviews - Only for practitioners and single-location clinics (multi-location moved above) */}
      {(isPractitioner || !isMultiple) && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPractitioner && !isMultiple && (
              <div className="space-y-3 pb-4 border-b mb-4">
                <h4 className="font-medium">Aggregate Rating</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Average Rating</Label>
                    <Input
                      value={formData.ratingValue || ''}
                      onChange={(e) => updateField('ratingValue', e.target.value)}
                      placeholder="4.8"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>
                  <div>
                    <Label>Total Review Count</Label>
                    <Input
                      value={formData.reviewCount || ''}
                      onChange={(e) => updateField('reviewCount', e.target.value)}
                      placeholder="187"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Individual Reviews</h4>
              <Button
                onClick={() => addArrayItem('reviews', { ratingValue: '', author: '' })}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </div>

            {formData.reviews?.map((review: any, index: number) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rating (out of 5)</Label>
                    <Input
                      value={review.ratingValue || ''}
                      onChange={(e) => updateArrayItemField('reviews', index, 'ratingValue', e.target.value)}
                      placeholder="4.5"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>
                  <div>
                    <Label>Author Name</Label>
                    <Input
                      value={review.author || ''}
                      onChange={(e) => updateArrayItemField('reviews', index, 'author', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                {formData.reviews.length > 1 && (
                  <Button
                    onClick={() => removeArrayItem('reviews', index)}
                    size="icon"
                    variant="ghost"
                    className="text-destructive mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchemaForm;
