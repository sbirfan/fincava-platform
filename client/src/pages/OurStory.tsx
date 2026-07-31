import { usePageTitle } from '../lib/usePageTitle.js';

const proseP = 'text-sm text-fc-ink-2 leading-relaxed mb-4';
const sectionH2 = 'font-display text-2xl font-medium text-fc-ink mb-3 mt-10';
const sectionH3 = 'font-display text-lg font-medium text-fc-ink mb-2.5 mt-7';

export default function OurStory() {
  usePageTitle(
    'Our Story',
    'The personal story behind FINCAVA — why we came to Colombia, what led us to coffee, and what we believe about the producers we work with.',
  );

  return (
    <div>
      <div className="bg-fc-paper-2 border-b border-fc-line py-12 md:py-16">
        <div className="max-w-[760px] mx-auto px-6 md:px-8">
          <div className="text-[12px] font-medium tracking-[0.16em] uppercase text-fc-sage-deep mb-3">
            From the founders
          </div>
          <h1 className="font-display font-medium text-3xl md:text-4xl leading-snug text-fc-ink">
            Our Story
          </h1>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-6 md:px-8 py-10">
        <p className={proseP}>People often ask us why we started FINCAVA.</p>
        <p className={proseP}>
          The honest answer is that we never set out to build a coffee company. We came to Colombia
          looking for a different way of life more determination than certainty, more ideas than
          experience, and a belief that if we surrounded ourselves with good people and stayed true
          to our values, we'd find our path.
        </p>
        <p className={proseP}>
          Some ideas worked. Some didn't. That's exactly how we found FINCAVA.
        </p>
        <p className={proseP}>
          For two years, we ran a coworking space, business incubator, and complimentary coffee shop
          where entrepreneurs and small business owners gathered to work and share ideas. The
          business itself wasn't the right fit for the location but it gave us something more
          valuable than financial success: relationships. Those relationships introduced us to
          family-owned coffee farms and agricultural entrepreneurs whose knowledge had been passed
          down for generations.
        </p>
        <p className={proseP}>
          We weren't falling in love with coffee. We were falling in love with the people behind it.
        </p>

        <h2 className={sectionH2}>Before FINCAVA</h2>
        <p className={proseP}>
          Katherine spent years managing medical facilities, learning firsthand where modern
          healthcare systems succeed and where they fall short, before leaving to build her own
          venture. Today, alongside FINCAVA, she still volunteers her time connecting patients with
          and translating for a local functional-medicine physician whose food-first approach to
          healing reflects the same belief in sustainable, people-centered solutions.
        </p>
        <p className={proseP}>
          Irfan spent more than thirty years in the technology industry, the last decade leading
          transformation programs for underperforming organizations. The work was never really about
          technology it was about understanding people, solving hard problems, and helping
          organizations reach their potential.
        </p>
        <p className={proseP}>
          Neither of us realized those experiences were preparing us for FINCAVA. Today, they shape
          everything we do.
        </p>

        <h2 className={sectionH2}>What We Believe</h2>
        <p className={proseP}>
          The world doesn't have a shortage of exceptional producers. It has a shortage of
          opportunities for people to discover them.
        </p>
        <p className={proseP}>
          Too often, small farms are known only by the commodities they produce, not the families
          and expertise behind them. We wanted to help change that not by changing how they farm,
          but by changing how the world discovers them.
        </p>

        <h3 className={sectionH3}>Women First</h3>
        <p className={proseP}>
          From the beginning, FINCAVA has been committed to supporting women-led farms and
          agricultural businesses.
        </p>
        <p className={proseP}>
          Not because they need rescuing. They don't. They're experienced producers, business
          owners, and leaders in their communities. What many need isn't someone to teach them how
          to grow better coffee they've already mastered that. What they need is greater visibility,
          trusted relationships, and access to markets that recognize the value of what they already
          produce.
        </p>
        <p className={proseP}>
          That's why we describe FINCAVA as women-first, not women-only. Women-led producers remain
          at the heart of our mission, while we also partner with exceptional family farms and small
          agricultural businesses that share our commitment to quality, transparency, and
          stewardship.
        </p>

        <h3 className={sectionH3}>More Than Coffee</h3>
        <p className={proseP}>
          Coffee is where our journey begins. Soon, we'll expand into cacao. Over time, we hope to
          introduce other agricultural products from producers whose values align with ours.
        </p>
        <p className={proseP}>
          Whatever the product, our purpose stays the same: help remarkable people reach remarkable
          markets.
        </p>

        <h2 className={sectionH2}>Just Getting Started</h2>
        <p className={proseP}>
          We're at the beginning of our journey. We don't pretend to have decades of experience
          exporting agricultural products, and we know there will be challenges — building
          relationships across countries, cultures, and supply chains takes time. We welcome those
          challenges, because each one is a chance to learn, improve, and better serve the producers
          and partners who trust us.
        </p>
        <p className={proseP}>
          Some visitors will choose to work with us today. Others may follow our journey and
          reconnect in a year or two. Either is perfectly okay.
        </p>
        <p className={proseP}>
          Trust isn't something we expect because we have a website. It's something we intend to
          earn, through every conversation, every partnership, and every promise we keep.
        </p>

        <h2 className={sectionH2}>Our Vision</h2>
        <p className={proseP}>
          We envision a future where exceptional producers are recognized not only for what they
          grow, but for who they are where buyers know the people behind what they purchase, where
          technology strengthens relationships instead of replacing them, and where trust is built
          through transparency.
        </p>
        <p className={proseP}>
          We don't believe the future of agriculture is built by changing the people who grow it. We
          believe it's built by changing how the world discovers them.
        </p>
      </div>

      <div className="max-w-[760px] mx-auto px-6 md:px-8 pb-14">
        <div className="bg-fc-sage-soft rounded-fc-lg p-8 md:p-10 text-center">
          <p className="font-display text-lg md:text-xl font-medium text-fc-ink leading-snug mb-2">
            The Bean. The Roast. The Hand. Together, they create every exceptional cup.
          </p>
          <p className="text-sm text-fc-ink-2 leading-relaxed">
            Grown by the farmer. Crafted by the roaster. Delivered by the hand that serves it.
          </p>
        </div>
      </div>
    </div>
  );
}
