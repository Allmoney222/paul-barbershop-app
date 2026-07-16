import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Terms of Service | 2Gether Hair Studio",
  description:
    "Terms of service for 2Gether Hair Studio in Buffalo, NY, covering booking, payments, and SMS notification policies.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <section className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C9A96E]">Terms of Service</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">2Gether Hair Studio Terms of Service</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#CCCCCC]">
              These terms govern your use of the 2Gether Hair Studio website and booking services. By scheduling an appointment, making a payment, or opting
              into SMS notifications, you agree to these terms.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white">Booking and Appointments</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                Appointments are subject to availability. You agree to provide accurate contact and scheduling information when booking.
                2Gether Hair Studio may require advance notice for cancellations or rescheduling.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-6 text-[#CCCCCC]">
                <li>Appointment confirmations are sent by email or SMS.</li>
                <li>Changes to your appointment may require additional notice.</li>
                <li>Failure to arrive on time may result in a modified service or cancellation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Payment Terms</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                Payments are processed through Stripe. You agree to pay all charges for services booked through the website.
                Prices and availability may change, and cancellations or refunds are handled according to salon policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Stripe Payment Processing</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                We use Stripe to securely process credit card and payment information. Stripe stores your payment details and follows its own privacy and security policies.
                2Gether Hair Studio does not retain full card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">SMS Notifications</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                With your consent, we may send SMS notifications for appointment confirmations, reminders, and service updates.
                Messages are delivered via Twilio, and phone numbers are used only for appointment-related communication.
                Mobile numbers are not shared with third parties or affiliates for marketing purposes. Message frequency varies.
                Message and data rates may apply. Reply <strong>HELP</strong> for help or <strong>STOP</strong> to opt out at any time.
                For support, contact 2Gether Hair Studio at (716) 364-6871 or twogetherhairstudio@yahoo.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                You are responsible for maintaining current contact information and honoring appointment commitments.
                Misuse of the booking system or providing fraudulent information may result in service denial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                2Gether Hair Studio is not liable for indirect, incidental, or consequential damages arising from website use or appointment scheduling.
                We strive for excellent service, but our liability is limited to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Contact and Updates</h2>
              <p className="mt-3 text-[#CCCCCC] leading-7">
                We may update these terms from time to time. Continued use of the site after any changes means you accept the revised terms.
                For questions, please contact 2Gether Hair Studio in Buffalo, NY.
              </p>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
