"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, ArrowLeft, User, Mail, Phone, Building, FileText, CheckCircle } from "lucide-react";
import { getEventBySlug } from "@/lib/events";
import { EventRegistrationRequest } from "@/types";
import { registerForEvent } from "@/lib/event-registration";

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const res = await getEventBySlug(slug);
      return res.data.data;
    },
  });

  const [formData, setFormData] = useState<EventRegistrationRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const event = eventData;

  const handleChange = (field: keyof EventRegistrationRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const registrationResponse = await registerForEvent(slug, formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/events/${slug}?registered=true`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-soil-sand/50 rounded w-1/3" />
          <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
          <div className="h-64 bg-soil-sand/50 rounded" />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <p className="text-earth-gray text-lg">Event not found.</p>
        <Link href="/events" className="text-soil-clay hover:underline mt-4 inline-block">Back to Events</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Event Details
          </Link>
          <p className="text-soil-sand fluid-lg font-medium mb-2">Event Registration</p>
          <h1 className="fluid-3xl md:fluid-4xl font-bold font-heading">{event.titleEn || event.titleAr}</h1>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {isSuccess ? (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                  <h2 className="fluid-2xl font-bold text-green-800">Registration Successful!</h2>
                  <p className="text-green-700">
                    You have successfully registered for &ldquo;{event.titleEn || event.titleAr}&rdquo;.
                  </p>
                  <p className="fluid-sm text-green-600">
                    Redirecting to the event page...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-soil-sand/50">
              <CardHeader>
                <CardTitle className="text-2xl text-soil-dark">Register for Event</CardTitle>
                <CardDescription>
                  Complete the form below to register for this event.
                </CardDescription>
              </CardHeader>

              {error && (
                <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="fluid-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={handleChange("name")}
                          placeholder="Enter your full name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={handleChange("email")}
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={handleChange("phone")}
                          placeholder="+963 123 456 789"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Affiliation</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          value={formData.organization || ""}
                          onChange={handleChange("organization")}
                          placeholder="University, Company, etc."
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={handleChange("notes")}
                        placeholder="Any special requirements or information..."
                        className="pl-10 min-h-24"
                      />
                    </div>
                  </div>

                  <div className="bg-soil-sand/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-soil-dark mb-3">Event Details</h3>
                    <div className="space-y-2 fluid-sm">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-soil-clay mt-0.5" />
                        <span>{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-soil-clay mt-0.5" />
                        <span>Registration Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not specified"}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-soil-clay mt-0.5" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-soil-clay hover:bg-soil-dark text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register for Event"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
