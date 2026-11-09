"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type data from "@/data/studio.json";
import Icon from "./icon";
import { HeroStories, WelcomeIntro } from "./hero-experience";
import ImpactLab from "./impact-lab";

type Content = typeof data;
const money = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

function Brand() {
  return (
    <a href="#overview" className="brand" aria-label="HRank Studio — Trang chủ">
      <span className="brand-symbol">h<span>.</span></span>
      <span>HRank<span className="brand-studio"> Studio</span></span>
    </a>
  );
}

function ServiceOverlay({ service }: { service: string }) {
  if (service === "local-seo") {
    return (
      <div className="visual-map-card" aria-hidden="true">
        <span className="visual-map-icon"><Icon name="pin" size={24} /></span>
        <div><strong>Doanh nghiệp của bạn</strong><small>Hiện diện ngay nơi khách tìm</small></div>
        <span className="visual-verified"><Icon name="check" size={13} /></span>
      </div>
    );
  }
  if (service === "website") {
    return (
      <div className="visual-browser" aria-hidden="true">
        <div className="browser-toolbar"><span /><span /><span /><small>yourbrand.vn</small></div>
        <div className="browser-content"><span>YOUR BRAND, ONLINE.</span><strong>Một điểm chạm.<br />Nhiều cơ hội.</strong><div /><span className="browser-button">Khám phá thương hiệu ↗</span></div>
      </div>
    );
  }
  return (
    <div className="visual-ai-card" aria-hidden="true">
      <span className="ai-avatar"><Icon name="spark" size={18} /></span>
      <div><strong>Một lời cảm ơn, luôn kịp lúc.</strong><p>“Cảm ơn bạn đã ghé thăm. Rất mong được đón bạn trở lại!”</p><small><span className="live-dot" /> AI hỗ trợ phản hồi review</small></div>
    </div>
  );
}

export default function Studio({ content }: { content: Content }) {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const finishIntroduction = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
    if (!introComplete || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section:not(#overview)"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.reveal = "visible";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    sections.forEach((section) => {
      section.dataset.reveal = "pending";
      observer.observe(section);
    });
    const revealFocused = (event: FocusEvent) => {
      const section = (event.target as HTMLElement).closest<HTMLElement>("[data-reveal]");
      if (section) {
        section.dataset.reveal = "visible";
        observer.unobserve(section);
      }
    };
    const revealAll = () => {
      if (!preference.matches) return;
      sections.forEach((section) => { section.dataset.reveal = "visible"; });
      observer.disconnect();
    };
    document.addEventListener("focusin", revealFocused);
    preference.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      sections.forEach((section) => { delete section.dataset.reveal; });
      document.removeEventListener("focusin", revealFocused);
      preference.removeEventListener("change", revealAll);
    };
  }, [introComplete]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-90px 0px -55% 0px" });
    content.navigation.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [content.navigation]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="site">
      {!introComplete && <WelcomeIntro introduction={content.introduction} onComplete={finishIntroduction} />}
      <a className="skip-link" href="#main">Đến nội dung chính</a>
      <header className="site-header">
        <div className="site-container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {content.navigation.filter((item) => ["services", "impact", "pricing"].includes(item.id)).map((item) => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined}>{item.label}</a>)}
          </nav>
          <div className="header-actions">
            <a className="button button-primary header-cta" href="#contact">Cùng trò chuyện <Icon name="arrow" size={16} /></a>
            <button id="menu-toggle" className="menu-toggle" type="button" aria-label={menuOpen ? "Đóng điều hướng" : "Mở điều hướng"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
          </div>
        </div>
        {menuOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Điều hướng di động">{content.navigation.map((item) => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined} onClick={() => setMenuOpen(false)}>{item.label}<Icon name="arrow" size={15} /></a>)}</nav>}
      </header>

      <main id="main">
        <section id="overview" className="hero-section site-container">
          <div className="hero-grid">
            <HeroStories stories={content.heroStories} ready={introComplete} />
            <div className="hero-collage">
              <div className="hero-photo">
                <Image src={content.media.hero.src} alt={content.media.hero.alt} fill sizes="(max-width: 700px) 100vw, 55vw" preload />
                <div className="photo-shade" />
                <div className="hero-photo-caption"><span>NHỮNG ĐIỂM ĐẾN XỨNG ĐÁNG ĐƯỢC TÌM THẤY.</span><strong>Dịch vụ tốt.<br />Cần một điểm chạm tốt.</strong></div>
              </div>
              <div className="hero-location-card"><span className="location-pin"><Icon name="pin" size={24} /></span><div><strong>Khách hàng ở rất gần.</strong><small>Để HRank kết nối bạn với họ.</small></div><span className="location-dot" /></div>
              <div className="hero-inset"><Image src={content.media.inset.src} alt={content.media.inset.alt} fill sizes="(max-width: 700px) 35vw, 200px" /><span>Thêm hiện diện.<br /><strong>Thêm cơ hội.</strong><Icon name="arrow" size={18} /></span></div>
              <svg className="hero-scribble" viewBox="0 0 190 130" fill="none" aria-hidden="true"><path d="M6 107C63 128 133 73 87 50S33 93 110 84 172 36 176 12m-13 11 14-15 7 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 5" /></svg>
              <span className="visual-caption">Hình ảnh minh họa</span>
            </div>
          </div>
          <div className="hero-footer"><span>ĐỘI NGŨ NHỎ. TẬN TÂM LỚN.</span><div>{content.industries.map((industry) => <span key={industry}>{industry}</span>)}</div><a href="#services" aria-label="Cuộn đến giải pháp"><Icon name="down" size={18} /></a></div>
        </section>

        <ImpactLab data={content.impactLab} />

        <section id="services" className="section services-section site-container">
          <div className="section-heading"><div><p className="eyebrow">01 / ĐÚNG ĐIỂM CHẠM, ĐÚNG CƠ HỘI</p><h2>Được nhìn thấy.<br /><span>Được khách lựa chọn.</span></h2></div><p>Ba giải pháp thiết thực.<br />Một hành trình phát triển cùng bạn.</p></div>
          <div className="service-grid">
            {content.services.map((service, index) => {
              const visual = content.media.services.find((item) => item.id === service.id)!;
              return (
                <article className={`service-card service-${service.id}`} key={service.id}>
                  <div className="service-image"><Image src={visual.src} alt={visual.alt} fill sizes="(max-width: 700px) 100vw, 33vw" /><span className="service-number">0{index + 1}</span><ServiceOverlay service={service.id} /></div>
                  <div className="service-copy"><span className="eyebrow">{visual.caption}</span><h3>{visual.label}<span>.</span></h3><p>{service.promise}</p><a href="#contact" aria-label={`Tư vấn ${service.name}`}><span>{service.name}</span><span className="circle-arrow"><Icon name="arrow" size={18} /></span></a></div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="industries-section">
          <div className="site-container">
            <div className="section-heading"><div><p className="eyebrow">DÀNH CHO NHỮNG ĐIỂM ĐẾN CÓ CÂU CHUYỆN</p><h2>Bạn chăm chút trải nghiệm.<br /><span>Chúng tôi chăm chút hiện diện.</span></h2></div><a className="text-link" href="#contact">Tìm giải pháp cho bạn <Icon name="arrow" size={17} /></a></div>
            <div className="industry-grid">{content.media.industries.map((industry) => <a className="industry-card" key={industry.name} href="#contact"><Image src={industry.src} alt={industry.alt} fill sizes="(max-width: 700px) 85vw, 33vw" /><div className="photo-shade" /><div className="industry-caption"><span>{industry.tag}</span><h3>{industry.name}</h3></div><span className="industry-arrow"><Icon name="arrow" size={20} /></span></a>)}</div>
            <p className="image-disclaimer">Ảnh minh họa lĩnh vực phục vụ, không phải dự án hoặc khách hàng đã triển khai.</p>
          </div>
        </section>

        <section id="pricing" className="section pricing-section site-container">
          <div className="section-heading"><div><p className="eyebrow">02 / MỘT KHỞI ĐẦU VỪA VẶN</p><h2>Đầu tư cho hiện diện.<br /><span>Chọn nhịp phát triển của bạn.</span></h2></div><p>Chi phí rõ ràng.<br />Đồng hành theo từng giai đoạn.</p></div>
          <div className="pricing-grid">{content.plans.map((plan) => <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.id}><div className="plan-heading"><span className="plan-icon"><Icon name={plan.featured ? "layers" : plan.id === "starter" ? "leaf" : "spark"} size={24} /></span>{plan.featured && <span className="popular-label">HRANK ĐỀ XUẤT</span>}</div><h3>{plan.name}</h3><p className="plan-subtitle">{plan.subtitle}</p><div className="price">{money(plan.price)}<span>đ</span></div><p className="setup-label">Triển khai ban đầu</p><p className="maintenance">Duy trì <strong>{money(plan.maintenance)}đ</strong> / tháng</p><a href="#contact" className={`button ${plan.featured ? "button-primary" : "button-outline"}`} onClick={() => { setSelectedPlan(plan.id); setSubmitted(false); }}>Chọn gói {plan.name.toLowerCase()} <Icon name="arrow" size={17} /></a><ul className="plan-features">{plan.features.slice(0, 3).map((feature) => <li key={feature}><Icon name="check" size={15} />{feature}</li>)}</ul><details className="plan-details"><summary>Xem đầy đủ quyền lợi <Icon name="down" size={14} /></summary><ul>{plan.features.slice(3).map((feature) => <li key={feature}>{feature}</li>)}</ul><p>{plan.note}</p></details></article>)}</div>
          <details className="pricing-terms"><summary><span><span className="info-symbol">i</span> Chỉ tính phí duy trì sau khi SEO lên top</span><span>Chi phí & điều kiện <Icon name="down" size={15} /></span></summary><div>{content.pricingNotes.map((note) => <p key={note}>{note}</p>)}<p>Phạm vi SEO tham khảo: 1–5 km. Map mới thường khoảng 2–4 tuần, tùy độ cạnh tranh và tình trạng hồ sơ; không phải cam kết thứ hạng hoặc thời hạn.</p></div></details>
        </section>

        <section id="process" className="section process-section site-container">
          <div className="process-photo"><Image src={content.media.studio.src} alt={content.media.studio.alt} fill sizes="(max-width: 700px) 100vw, 45vw" /><div className="process-photo-label"><span className="mini-brand">h.</span><p>Không chỉ triển khai.<br /><strong>Còn cùng bạn đi tiếp.</strong></p></div></div>
          <div className="process-copy"><p className="eyebrow">03 / LÀM VIỆC CÙNG HRANK</p><h2>Ít phức tạp.<br /><span>Nhiều thấu hiểu.</span></h2><div className="process-steps">{content.steps.map((step) => <div className="process-step" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></div>)}</div></div>
        </section>

        <section id="faq" className="section faq-section site-container"><div><p className="eyebrow">TRƯỚC KHI BẮT ĐẦU</p><h2>Còn điều gì<br /><span>bạn muốn biết?</span></h2></div><div className="faq-list">{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div></section>

        <section id="contact" className="contact-section">
          <div className="site-container contact-layout"><div className="contact-copy"><p className="eyebrow"><span className="live-dot" /> CÂU CHUYỆN TIẾP THEO, LÀ DOANH NGHIỆP BẠN.</p><h2>Bắt đầu bằng<br />một lời <em>chào.</em></h2><a className="contact-phone" href={`tel:${content.brand.phoneHref}`}>{content.brand.phone}<Icon name="arrow" size={25} /></a><a className="text-link" href={content.brand.zalo} target="_blank" rel="noopener noreferrer">Nhắn chúng tôi qua Zalo <Icon name="arrow" size={17} /></a><svg className="contact-flower" viewBox="0 0 180 180" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.2"><ellipse cx="90" cy="90" rx="80" ry="25" /><ellipse cx="90" cy="90" rx="80" ry="25" transform="rotate(45 90 90)" /><ellipse cx="90" cy="90" rx="80" ry="25" transform="rotate(90 90 90)" /><ellipse cx="90" cy="90" rx="80" ry="25" transform="rotate(135 90 90)" /><circle cx="90" cy="90" r="12" /></g></svg></div><form className="contact-form" onSubmit={submitInquiry} onChange={() => setSubmitted(false)}><h3>Cùng tìm hướng đi phù hợp.</h3><p className="mock-notice">Bản xem trước · Chưa gửi hoặc lưu dữ liệu.</p><label>Tên của bạn<input name="name" placeholder="Chúng tôi nên gọi bạn là..." required autoComplete="name" maxLength={100} /></label><label>Số điện thoại<input name="phone" type="tel" placeholder="Số điện thoại để kết nối" required autoComplete="tel" pattern="[+0-9\s().\-]{8,20}" maxLength={20} /></label><label>Bạn đang quan tâm đến<select name="plan" value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)}><option value="">Tôi cần được tư vấn thêm</option>{content.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {money(plan.price)}đ</option>)}</select></label><button type="submit" className="button button-primary">Xem trước yêu cầu <Icon name="arrow" size={18} /></button>{submitted && <p className="form-feedback" role="status">Thông tin hợp lệ. Đây là bản mock, yêu cầu chưa được gửi. <a href={content.brand.zalo} target="_blank" rel="noopener noreferrer">Nhắn Zalo để trao đổi trực tiếp.</a></p>}<p className="form-footnote">Một cuộc trò chuyện, không ràng buộc.</p></form></div>
        </section>
      </main>
      <footer className="site-container footer"><div className="footer-top"><Brand /><p>Đội ngũ nhỏ. Giá trị thực. Cùng bạn đi xa.</p><a href="#overview" className="text-link">Về đầu trang <Icon name="arrow" size={15} /></a></div><div className="footer-bottom"><p>© 2026 HRank Studio.</p><p>{content.media.credit}</p></div></footer>
    </div>
  );
}
