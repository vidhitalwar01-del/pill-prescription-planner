import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/80 backdrop-blur-md mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a 
                  href="mailto:support@meditrack.com" 
                  className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  aria-label="Email support"
                >
                  support@meditrack.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <a 
                  href="tel:+1234567890" 
                  className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  aria-label="Call support"
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>123 Health St, Wellness City</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick Links
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                to="/dashboard" 
                className="block text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                Dashboard
              </Link>
              <Link 
                to="/add-medication" 
                className="block text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                Add Medication
              </Link>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              About MediTrack
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MediTrack helps you stay on top of your medication schedule with smart reminders, 
              progress tracking, and wellness features. Your health journey, simplified.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} MediTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
