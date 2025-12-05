import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSchema, EntityType, LocationType } from '@/context/SchemaContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SchemaForm from '@/components/SchemaForm';
import SchemaPreview from '@/components/SchemaPreview';
import { getSchemaTemplate, cleanSchema } from '@/utils/schemaTemplates';
import { Badge } from '@/components/ui/badge';
import { SaveSchemaDialog } from '@/components/SaveSchemaDialog';
import { LoadSchemaDialog } from '@/components/LoadSchemaDialog';

const SchemaGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { entityType, locationType, resetSchema, setSchemaType } = useSchema();
  const [formData, setFormData] = useState<any>({});
  const [generatedSchema, setGeneratedSchema] = useState<any>({});

  // Load data from navigation state if available
  useEffect(() => {
    const state = location.state as { loadedData?: any };
    if (state?.loadedData) {
      setFormData(state.loadedData);
      // Clear the state to prevent reloading on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleLoadSchema = (loadedEntityType: EntityType, loadedLocationType: LocationType, data: any) => {
    setSchemaType(loadedEntityType, loadedLocationType);
    setFormData(data);
  };

  useEffect(() => {
    if (!entityType || !locationType) {
      navigate('/');
      return;
    }
  }, [entityType, locationType, navigate]);

  useEffect(() => {
    // Generate schema from form data
    if (entityType && locationType) {
      const schema = buildSchema(entityType, locationType, formData);
      const cleaned = cleanSchema(schema);
      setGeneratedSchema(cleaned || {});
    }
  }, [formData, entityType, locationType]);

  const buildSchema = (entity: string, location: string, data: any): any => {
    const isPractitioner = entity === 'practitioner';
    const isMultiple = location === 'multiple';

    let schema: any = {
      "@context": "https://schema.org"
    };

    if (isPractitioner) {
      schema["@type"] = "Physician";
      schema.name = data.name;
      schema.honorificSuffix = data.honorificSuffix;
      schema.jobTitle = data.jobTitle;
      schema.url = data.url;
      schema.telephone = data.telephone;
      schema.sameAs = data.sameAs;

      if (isMultiple) {
        // Multiple locations - all share the same services
        schema.worksFor = data.worksFor?.map((loc: any) => ({
          "@type": "MedicalClinic",
          name: loc.name,
          url: loc.url,
          telephone: loc.telephone,
          address: {
            "@type": "PostalAddress",
            streetAddress: loc.streetAddress,
            addressLocality: loc.city,
            addressRegion: loc.region,
            postalCode: loc.postalCode,
            addressCountry: loc.country
          },
          geo: loc.latitude && loc.longitude ? {
            "@type": "GeoCoordinates",
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude)
          } : undefined,
          openingHoursSpecification: loc.openingHours?.map((h: any) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes
          })),
          // Use shared services from data.services
          availableService: data.services?.map((s: string) => ({
            "@type": "MedicalProcedure",
            name: s
          }))
        }));
      } else {
        // Single location
        const loc = data.worksFor || {};
        schema.worksFor = {
          "@type": "MedicalClinic",
          name: loc.name,
          url: loc.url,
          telephone: loc.telephone,
          address: {
            "@type": "PostalAddress",
            streetAddress: loc.streetAddress,
            addressLocality: loc.city,
            addressRegion: loc.region,
            postalCode: loc.postalCode,
            addressCountry: loc.country
          },
          geo: loc.latitude && loc.longitude ? {
            "@type": "GeoCoordinates",
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude)
          } : undefined,
          openingHoursSpecification: loc.openingHours?.map((h: any) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes
          })),
          availableService: loc.services?.map((s: string) => ({
            "@type": "MedicalProcedure",
            name: s
          }))
        };
      }

    } else {
      // Clinic - Always use Physician and MedicalClinic
      schema["@type"] = ["Physician", "MedicalClinic"];
      schema.name = data.name;
      schema.description = data.description;
      schema.url = data.url;
      schema.telephone = data.telephone;
      schema.email = data.email;
      schema.priceRange = data.priceRange;
      schema.logo = data.logo;
      schema.image = data.image;
      schema.hasMap = data.hasMap;
      schema.sameAs = data.sameAs;
      schema.medicalSpecialty = data.medicalSpecialty;

      if (!isMultiple) {
        // Single clinic
        schema.address = {
          "@type": "PostalAddress",
          streetAddress: data.streetAddress,
          addressLocality: data.city,
          addressRegion: data.region,
          postalCode: data.postalCode,
          addressCountry: data.country
        };

        schema.geo = data.latitude && data.longitude ? {
          "@type": "GeoCoordinates",
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        } : undefined;

        schema.openingHoursSpecification = data.openingHours?.map((h: any) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes
        }));

        schema.availableService = data.services?.map((s: string) => ({
          "@type": "MedicalProcedure",
          name: s
        }));

        schema.aggregateRating = data.ratingValue ? {
          "@type": "AggregateRating",
          ratingValue: parseFloat(data.ratingValue),
          reviewCount: parseInt(data.reviewCount) || 0
        } : undefined;
      } else {
        // Multiple locations - Use subOrganization instead of department
        schema.address = {
          "@type": "PostalAddress",
          streetAddress: data.streetAddress,
          addressLocality: data.city,
          addressRegion: data.region,
          postalCode: data.postalCode,
          addressCountry: data.country
        };

        schema.geo = data.latitude && data.longitude ? {
          "@type": "GeoCoordinates",
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        } : undefined;

        schema.openingHoursSpecification = data.openingHours?.map((h: any) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes
        }));

        schema.availableService = data.services?.map((s: string) => ({
          "@type": "MedicalProcedure",
          name: s
        }));

        schema.aggregateRating = data.ratingValue ? {
          "@type": "AggregateRating",
          ratingValue: parseFloat(data.ratingValue),
          reviewCount: parseInt(data.reviewCount) || 0
        } : undefined;

        // Only include subOrganization if there are additional locations
        schema.subOrganization = data.subOrganizations?.map((org: any) => {
          return {
            "@type": ["Physician", "MedicalClinic"],
            name: org.name,
            hasMap: org.hasMap,
            address: {
              "@type": "PostalAddress",
              streetAddress: org.streetAddress,
              addressLocality: org.city,
              addressRegion: org.region,
              postalCode: org.postalCode,
              addressCountry: org.country
            },
            geo: org.latitude && org.longitude ? {
              "@type": "GeoCoordinates",
              latitude: parseFloat(org.latitude),
              longitude: parseFloat(org.longitude)
            } : undefined,
            openingHoursSpecification: org.openingHours?.map((h: any) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: h.days,
              opens: h.opens,
              closes: h.closes
            }))
          };
        });
      }
    }

    return schema;
  };

  const handleBack = () => {
    resetSchema();
    navigate('/');
  };

  const getSchemaTypeLabel = () => {
    if (!entityType || !locationType) return '';
    
    const entity = entityType === 'practitioner' ? 'Practitioner' : 'Medical Clinic';
    const location = locationType === 'single' ? 'Single Location' : 'Multiple Locations';
    
    return `${entity} - ${location}`;
  };

  if (!entityType || !locationType) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <Badge variant="secondary" className="text-sm">
            {getSchemaTypeLabel()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <SaveSchemaDialog 
            entityType={entityType} 
            locationType={locationType} 
            formData={formData} 
          />
          <LoadSchemaDialog onLoad={handleLoadSchema} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SchemaForm
            entityType={entityType}
            locationType={locationType}
            onDataChange={setFormData}
          />
        </div>

        <div>
          <SchemaPreview schema={generatedSchema} />
        </div>
      </div>
    </div>
  );
};

export default SchemaGenerator;
