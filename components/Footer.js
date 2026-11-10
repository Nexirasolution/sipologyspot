import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaAmazon, FaYoutube } from "react-icons/fa6";
import Reveal from "@/components/Reveal";
import { PhoneIcon, WhatsappIcon, LocationIcon } from "./Icons";

// Gold underline that sweeps across a link on hover and keyboard focus
const UNDERLINE =
  "rounded bg-[linear-gradient(#C9A227,#C9A227)] bg-[length:0_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out hover:bg-[length:100%_2px] focus-visible:bg-[length:100%_2px]";

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track order" },
  { href: "/cart", label: "Cart" },
];

// Meesho has no icon in react-icons, so it gets a simple letter mark
function MeeshoMark({ className }) {
  return <span className={`font-display text-base font-black leading-none ${className}`}>M</span>;
}

// Small gold circle that holds a decorative icon (hidden from screen readers)
function IconDot({ children }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition duration-500 group-hover:rotate-12 group-hover:scale-110"
    >
      {children}
    </span>
  );
}

const NewTabNote = () => <span className="sr-only"> (opens in a new tab)</span>;

export default function Footer({ settings }) {
  const storeName = settings?.storeName || "Sipology Spot Premium Organic Store";
  const phone = settings?.phone || "+91 6381163597";
  const whatsapp = settings?.whatsapp || "916381163597";
  const address =
    settings?.address ||
    "12 Vel Murugan Nagar, Station Road, Urapakkam West, Chennai - 603211";
  const email = settings?.email || "sipologyspot@gmail.com";

  // No public social/marketplace links provided yet — leave blank until settings supply them.
  const instagram = settings?.instagram || "";
  const facebook = settings?.facebook || "";
  const amazon = settings?.amazon || "";
  const meesho = settings?.meesho || "";
  const youtube = settings?.youtube;

  const onlineLinks = [
    { href: facebook, label: "Facebook", Icon: FaFacebookF },
    { href: instagram, label: "Instagram", Icon: FaInstagram },
    { href: amazon, label: "Amazon", Icon: FaAmazon },
    { href: meesho, label: "Meesho", Icon: MeeshoMark },
    { href: youtube, label: "YouTube", Icon: FaYoutube },
  ].filter((s) => s.href);

  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="bg-gold-pale text-ink">
      {/* Animated gold hairline */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full animate-shimmer bg-[linear-gradient(90deg,#F6EBC8,#C9A227,#F3DE8A,#C9A227,#F6EBC8)] bg-[length:200%_100%]"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-14 md:grid-cols-12 md:gap-10 md:py-20">
        {/* Brand */}
        <Reveal className="md:col-span-5">
          <Link href="/" className="group inline-flex items-center gap-4 rounded-2xl">
            <Image
              src="/images/logo.png"
              alt=""
              width={80}
              height={80}
              className="h-16 w-16 rounded-full object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105 md:h-20 md:w-20"
            />
            <span className="font-display text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
              {storeName}
            </span>
          </Link>

          <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-muted">
            Premium organic products, carefully sourced and delivered fresh from Chennai.
            Natural, wholesome goodness for your everyday living.
          </p>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold group mt-8 gap-2.5 text-sm"
            >
              <span aria-hidden="true">
                <WhatsappIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
              </span>
              WhatsApp us
              <NewTabNote />
            </a>
          )}
        </Reveal>

        {/* Explore */}
        <Reveal delay={120} className="md:col-span-3">
          <h2 className="font-display text-lg font-extrabold">Explore</h2>
          <nav aria-label="Footer">
            <ul role="list" className="mt-5 space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`inline-block font-display text-base font-bold text-ink transition-colors duration-300 hover:text-gold-deep ${UNDERLINE}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* Contact */}
        <Reveal delay={240} className="md:col-span-4">
          <h2 className="font-display text-lg font-extrabold">Contact</h2>
          <address className="not-italic">
            <ul role="list" className="mt-5 space-y-4">
              {phone && (
                <li className="group flex items-start gap-3">
                  <IconDot>
                    <PhoneIcon className="h-4 w-4" />
                  </IconDot>
                  <a
                    href={telHref}
                    className={`pt-1.5 font-semibold text-ink transition-colors hover:text-gold-deep ${UNDERLINE}`}
                  >
                    <span className="sr-only">Phone: </span>
                    {phone}
                  </a>
                </li>
              )}

              {email && (
                <li className="group flex items-start gap-3">
                  <IconDot>
                    <Mail className="h-4 w-4" />
                  </IconDot>
                  <a
                    href={`mailto:${email}`}
                    className={`break-all pt-1.5 font-semibold text-ink transition-colors hover:text-gold-deep ${UNDERLINE}`}
                  >
                    <span className="sr-only">Email: </span>
                    {email}
                  </a>
                </li>
              )}

              {address && (
                <li className="group flex items-start gap-3">
                  <IconDot>
                    <LocationIcon className="h-4 w-4" />
                  </IconDot>
                  <p className="pt-1.5 font-semibold leading-relaxed text-ink">
                    <span className="sr-only">Address: </span>
                    {address}
                  </p>
                </li>
              )}
            </ul>
          </address>

          {(settings?.gst || settings?.msme) && (
            <div className="mt-6 space-y-1 text-sm font-semibold text-muted">
              {settings?.gst && <p>GST No: {settings.gst}</p>}
              {settings?.msme && <p>MSME Registration: {settings.msme}</p>}
            </div>
          )}
        </Reveal>

        {/* Social + marketplaces */}
        {onlineLinks.length > 0 && (
          <Reveal delay={120} className="md:col-span-12">
            <div className="border-t border-gold/40 pt-10">
              <h2 className="font-display text-lg font-extrabold">Find us online</h2>
              <nav aria-label="Social media and marketplaces">
                <ul role="list" className="mt-5 flex flex-wrap gap-3">
                  {onlineLinks.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-11 items-center gap-2.5 rounded-full border-2 border-gold bg-white px-5 font-display text-sm font-bold text-ink transition duration-300 hover:-translate-y-1 hover:bg-gold hover:shadow-lg active:scale-95"
                      >
                        <span aria-hidden="true" className="flex">
                          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                        </span>
                        {label}
                        <NewTabNote />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Reveal>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm font-semibold text-muted md:flex-row">
          <div className="text-center md:text-left">
            <p>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <p className="mt-1">
              Developed &amp; designed by{" "}
              <a
                href="https://www.nexirasolution.in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold text-gold-deep hover:text-ink ${UNDERLINE}`}
              >
                Nexira Solution
                <NewTabNote />
              </a>
            </p>
          </div>

          {/* Jumps to the top of the page content; works without JavaScript */}
          <a
            href="#main-content"
            className="group flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-display text-sm font-bold text-gold transition duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-ink active:scale-95"
          >
            Back to top
            <ArrowUp
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}