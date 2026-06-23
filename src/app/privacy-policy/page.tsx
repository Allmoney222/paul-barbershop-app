import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Privacy Policy | 2Gether Hair Studio",
  description:
    "Privacy policy for 2Gether Hair Studio in Buffalo, NY, covering data collection, appointment booking, payment processing, and SMS notifications.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <section className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C9A96E]">
              Privacy Policy
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              2Gether Hair Studio Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#CCCCCC]">
              At 2Gether Hair Studio in Buffalo, NY, we respect your privacy and are committed to protecting your personal information.
              This policy explains the data we collect, how we use it, and how we safeguard your information when you book an appointment,
              make a payment, or receive SMS notifications.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                We collect information you provide directly when you book an appointment or contact us. This may include your name, email,
                phone number, appointment preferences, and any notes required to deliver your service.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-6 text-[#CCCCCC]">
                <li>Contact details such as name, email address, and phone number.</li>
                <li>Appointment date, service selection, and stylist preferences.</li>
                <li>Optional notes or preferences provided during booking.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                Your information helps us manage bookings, confirm appointments, communicate important updates, and deliver a smooth salon experience.
                We do not sell your personal data to third parties.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-6 text-[#CCCCCC]">
                <li>Confirm and manage your booking details.</li>
                <li>Send appointment reminders and updates.</li>
                <li>Provide customer support and respond to requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Appointment Booking</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                When you book an appointment through our website, we use your contact and booking information to reserve your preferred service time and share appointment details.
                We keep booking information for scheduling, service history, and follow-up communication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Payment Processing</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                Payments are processed securely through Stripe. We do not store your full payment details on our servers.
                Stripe handles card information and transactions under its own privacy and security practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">SMS Notifications</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                We may send SMS messages to confirm appointments, remind you of upcoming visits, or communicate urgent updates.
                These messages are delivered through Twilio, and phone numbers are used only for appointment-related communication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Data Retention and Security</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                We retain your booking and contact information as long as necessary to provide services, fulfill legal obligations, and improve our customer experience.
                We protect your data with reasonable administrative and technical safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                If you have questions about this privacy policy or your personal data, please contact us through the website or visit 2Gether Hair Studio in Buffalo, NY.
              </p>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
