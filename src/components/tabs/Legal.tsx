import React, { useState } from 'react';
import { Shield, FileText, Cookie, Users, Search, Printer, Download, Mail, ArrowRight, CheckCircle, Info, AlertTriangle, BookOpen } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

type LegalSection = 'privacy' | 'terms' | 'cookies' | 'community';

export default function Legal() {
  const { theme } = useAppContext();
  const [activeSection, setActiveSection] = useState<LegalSection>('privacy');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const sections = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'community', label: 'Community Guidelines', icon: Users }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Legal & Compliance Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last Updated: July 16, 2026 • Version 2.4.0
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Document</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search legal terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
            {sections.map((sect) => {
              const Icon = sect.icon;
              const isActive = activeSection === sect.id;
              return (
                <button
                  key={sect.id}
                  onClick={() => setActiveSection(sect.id as LegalSection)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sect.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-400 flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5" />
              Need clarification?
            </h4>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
              If you have any questions regarding these documents or our practices, please contact our privacy compliance officer.
            </p>
            <a 
              href="mailto:legal@yuvahub.com" 
              className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
            >
              <span>legal@yuvahub.com</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-surface dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm">
          {activeSection === 'privacy' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Document ref: PRIV-2026-B
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-3">
                  Privacy Policy
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Effective Date: July 16, 2026
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-400 flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Summary of Recent Updates</h4>
                  <p className="text-[11px] mt-1 leading-normal">
                    We have updated our policy to reflect new compliance standard requirements under GDPR and CCPA, enhanced security measures regarding Firebase Authentication, and provided details about AI interactions within the AIAssistant.
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  1. Introduction and Overview
                </h3>
                <p>
                  Welcome to YuvaHub ("Company", "we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs our data collection, processing, and usage practices when you visit and interact with our application located at yuvahub.com (the "Service").
                </p>
                <p>
                  By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy. If you do not agree with any terms in this policy, you must immediately discontinue use of all our products and services.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Information We Collect
                </h3>
                <p>
                  We collect information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products, participate in activities on the Service, or otherwise contact us.
                </p>
                
                <h4 className="font-bold text-gray-900 dark:text-white text-xs mt-2">A. Personal Data Provided by You</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Account Information:</strong> When signing in via Firebase Authentication (using Google or GitHub), we collect your name, email address, profile picture (avatarUrl), and unique user identifier (uid).
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Users may provide supplementary information during onboarding or when editing their profile, including education details, skills, social media links, resumes, and career goals.
                  </li>
                  <li>
                    <strong>Submission Details:</strong> If you submit an opportunity (competition, hackathon, internship, scholarship), we collect the title, category, description, external links, deadlines, and hosting organization details.
                  </li>
                </ul>

                <h4 className="font-bold text-gray-900 dark:text-white text-xs mt-2">B. Information Automatically Collected</h4>
                <p>
                  We automatically collect certain information when you visit, use, or navigate the Service. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser type, operating system, language preferences, referring URLs, device name, country, location, and details about how and when you use our Service.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Log and Usage Data:</strong> Our servers automatically collect service-diagnostic and performance data which is recorded in log files.
                  </li>
                  <li>
                    <strong>Device Data:</strong> We collect information about your computer, phone, tablet, or other device you use to access the Service.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. How We Use Your Information
                </h3>
                <p>
                  We use personal information collected via our Service for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>To Facilitate Account Creation and Logon Process:</strong> We use the information you allowed us to collect from Google or GitHub to facilitate the creation of your account and secure logon.
                  </li>
                  <li>
                    <strong>To Deliver and Facilitate Delivery of Services:</strong> We use your information to display relevant opportunities, enable bookmarks, track submissions, and render community chats.
                  </li>
                  <li>
                    <strong>To Provide AI-Driven Mentorship:</strong> Query details sent to our AIAssistant are processed using state-of-the-art Large Language Models (like Google Gemini API) to generate personalized learning paths and recommendation resources.
                  </li>
                  <li>
                    <strong>To Send Administrative Information:</strong> We may use your personal details to send you product updates, alerts, security notifications, and changes to our terms.
                  </li>
                  <li>
                    <strong>To Protect our Services:</strong> We use your information as part of our efforts to keep our Service safe and secure (for example, for fraud monitoring and prevention).
                  </li>
                  <li>
                    <strong>To Enforce Terms and Conditions:</strong> To ensure all users adhere to our community standards and prevent malicious behavior.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  4. Sharing Your Information
                </h3>
                <p>
                  We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </p>
                <p>
                  Specifically, we may process or share your data that we hold based on the following legal bases:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information for a specific purpose.
                  </li>
                  <li>
                    <strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests.
                  </li>
                  <li>
                    <strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  5. Data Retention & Transfer
                </h3>
                <p>
                  We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
                </p>
                <p>
                  Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United States and process it there.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  6. Your Privacy Rights (GDPR & CCPA)
                </h3>
                <p>
                  Depending on your geographical location, you may have rights that allow you greater access to and control over your personal information. Under GDPR (European Union) and CCPA (California, USA), these rights include:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Right of Access:</strong> The right to be informed of and request access to the personal data we process about you.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> The right to request that we amend or update your personal data where it is inaccurate or incomplete.
                  </li>
                  <li>
                    <strong>Right to Erasure (Right to be Forgotten):</strong> The right to request that we delete your personal data.
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> The right to request that we temporarily or permanently stop processing all or some of your personal data.
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> The right to request a copy of your personal data in a structured, commonly used, and machine-readable format.
                  </li>
                </ul>
                <p>
                  You can exercise these rights directly within your Account Settings panel under the "Account Control" tab or by contacting us directly at support@yuvahub.com.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  7. Children's Privacy
                </h3>
                <p>
                  Our services are directed to individuals who are at least 13 years of age or older. We do not knowingly collect personal identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us immediately so we can take necessary actions to remove that data from our servers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  8. Security of Your Information
                </h3>
                <p>
                  We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. Therefore, we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  9. Changes to this Privacy Policy
                </h3>
                <p>
                  We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this Privacy Policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'terms' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Document ref: TERMS-2026-A
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-3">
                  Terms of Service
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Effective Date: July 16, 2026
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  1. Agreement to Terms
                </h3>
                <p>
                  These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and YuvaHub ("we", "us", or "our"), concerning your access to and use of the yuvahub.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>
                <p>
                  You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Intellectual Property Rights
                </h3>
                <p>
                  Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
                </p>
                <p>
                  The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. User Representations and Registration
                </h3>
                <p>
                  By using the Site, you represent and warrant that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    All registration information you submit will be true, accurate, current, and complete.
                  </li>
                  <li>
                    You will maintain the accuracy of such information and promptly update such registration information as necessary.
                  </li>
                  <li>
                    You have the legal capacity and you agree to comply with these Terms of Service.
                  </li>
                  <li>
                    You are not under the age of 13.
                  </li>
                  <li>
                    You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.
                  </li>
                  <li>
                    Your use of the Site will not violate any applicable law or regulation.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  4. Prohibited Activities
                </h3>
                <p>
                  You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
                <p>
                  As a user of the Site, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.
                  </li>
                  <li>
                    Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.
                  </li>
                  <li>
                    Circumvent, disable, or otherwise interfere with security-related features of the Site.
                  </li>
                  <li>
                    Engage in unauthorized framing of or linking to the Site.
                  </li>
                  <li>
                    Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as passwords.
                  </li>
                  <li>
                    Make improper use of our support services or submit false reports of abuse or misconduct.
                  </li>
                  <li>
                    Use the Site in a manner inconsistent with any applicable laws or regulations.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  5. Opportunity Submissions
                </h3>
                <p>
                  Users may submit opportunities (e.g., hackathons, scholarship links, job postings) through the Service. By submitting an opportunity, you guarantee that you have all necessary permissions to publish the content, and that it does not infringe on third-party intellectual property or labor rights.
                </p>
                <p>
                  We reserve the right, but do not have the obligation, to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Monitor and screen submissions for quality, accuracy, and compliance with our guidelines.</li>
                  <li>Edit or remove any submission at our sole discretion, without prior notice.</li>
                  <li>Suspend accounts that repeatedly submit fraudulent or spam opportunities.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  6. Limitation of Liability
                </h3>
                <p>
                  IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  7. Governing Law
                </h3>
                <p>
                  These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to its conflict of law principles. Any legal action or proceeding related to this Site shall be brought exclusively in a federal or state court of competent jurisdiction sitting in Delaware.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'cookies' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Document ref: COOKIE-2026-A
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-3">
                  Cookie Policy
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Effective Date: July 16, 2026
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  1. What are Cookies?
                </h3>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, YuvaHub) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Why We Use Cookies
                </h3>
                <p>
                  We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Service to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Service for analytics, performance, and security.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. Categories of Cookies We Use
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-100 dark:border-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-950 dark:text-white text-xs">A. Essential Website Cookies</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our Website functions.
                    </p>
                  </div>
                  
                  <div className="border border-gray-100 dark:border-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-950 dark:text-white text-xs">B. Analytics and Customization Cookies</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you in order to enhance your experience.
                    </p>
                  </div>

                  <div className="border border-gray-100 dark:border-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-950 dark:text-white text-xs">C. Performance and Functionality Cookies</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like video playback or the AIAssistant session history) may become unavailable.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  4. Controlling and Deleting Cookies
                </h3>
                <p>
                  You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager or directly in your web browser settings. Most web browsers allow some control of most cookies through the browser settings.
                </p>
                <p>
                  To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'community' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Document ref: GUIDELINES-2026-C
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-3">
                  Community Guidelines
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Effective Date: July 16, 2026
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  1. Respect and Inclusivity
                </h3>
                <p>
                  YuvaHub is a space designed for students, learners, mentors, and recruiters from all backgrounds to connect, share knowledge, and discover opportunities. We are dedicated to providing a harassment-free and inclusive experience for everyone, regardless of gender, sexual orientation, disability, physical appearance, race, ethnicity, or religion.
                </p>
                <p>
                  We do not tolerate harassment, bullying, or discrimination of community members in any form. Sarcasm or humor that targets specific demographics or marginalizes individuals will be flagged and removed.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Constructive Interactions
                </h3>
                <p>
                  When communicating in our community channels, forums, or during mentorship sessions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Focus on learning:</strong> Share feedback that is constructive, specific, and actionable. Avoid derogatory remarks on others' skills or background.
                  </li>
                  <li>
                    <strong>Mentor Guidelines:</strong> Mentors should foster growth, encourage active listening, and respect the mentee's timeline. Mentees should respect the mentor's time and prepare beforehand.
                  </li>
                  <li>
                    <strong>No Spam or Self-Promotion:</strong> Refrain from pasting affiliate links, duplicate advertisements, or unrelated self-promotional content in general forums unless explicitly permitted in specified channels.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. Content Authenticity
                </h3>
                <p>
                  All opportunities (internships, hackathons, scholarships) submitted must be authentic. Submitting dead links, clickbait links, or fake contests designed to collect candidate data will result in immediate and permanent account suspension.
                </p>
                <p>
                  Plagiarism of project ideas, code repos, or submission descriptions is strictly prohibited. Give credit to original creators where credit is due.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
                  4. Reporting & Enforcement
                </h3>
                <p>
                  If you witness violations of these guidelines, please flag the content or contact community@yuvahub.com.
                </p>
                <p>
                  The YuvaHub moderation team reviews reports daily and will enforce actions ranging from:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Written warnings.</li>
                  <li>Removal of offending content.</li>
                  <li>Temporary account restrictions (e.g., read-only access).</li>
                  <li>Permanent account ban.</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
