"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Contact form submitted:", formData);
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <Navbar />
      <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about appointments or our services? We're here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-4 animate-fade-in animation-delay-200">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Reach out through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Emergency Hotline</p>
                      <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        +1 (234) 567-8900
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email Us</p>
                      <a href="mailto:support@medibook.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        support@medibook.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Main Clinic</p>
                      <p className="text-sm text-muted-foreground">
                        123 Healthcare Avenue<br />
                        Medical District, MD 12345
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Support Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 8:00 AM - 8:00 PM<br />
                        Saturday: 9:00 AM - 5:00 PM<br />
                        Sunday: 10:00 AM - 4:00 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 animate-fade-in animation-delay-400">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted && (
                    <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-500/30 text-green-400 animate-fade-in">
                      Thank you for contacting us! We'll respond shortly.
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (234) 567-8900"
                        value={formData.phone}
                        onChange={handleChange}
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Appointment Inquiry"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please describe your inquiry..."
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full md:w-auto transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  );
}