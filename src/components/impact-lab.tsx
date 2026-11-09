"use client";

import Image from "next/image";
import { useState } from "react";
import type content from "@/data/studio.json";
import { calculateRadarProfile, calculateWorkload, type WorkloadAssumptions } from "@/lib/impact-calculator";
import Icon from "./icon";

type LabContent = typeof content.impactLab;
type View = "map" | "website" | "operations";
type Comparison = "before" | "after";
const decimal = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value);
const hours = (minutes: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(minutes / 60);

function OptimizationProfile({ data, comparison, reviews, posts, assumptions }: {
  data: LabContent["optimizationProfile"];
  comparison: Comparison;
  reviews: number;
  posts: number;
  assumptions: WorkloadAssumptions;
}) {
  const [selected, setSelected] = useState("time");
  const scores = calculateRadarProfile(reviews, posts, assumptions, data.capacity);
  const active = data.attributes.find((attribute) => attribute.id === selected) ?? data.attributes[0];
  const point = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / data.attributes.length;
    return { x: 260 + Math.cos(angle) * radius, y: 260 + Math.sin(angle) * radius };
  };
  const vertices = data.attributes.map((attribute, index) => point(index, 160 * scores[comparison][attribute.id] / 100));
  const clip = `polygon(${vertices.map(({ x, y }) => `${x / 5.2}% ${y / 5.2}%`).join(", ")})`;
  const baseline = data.attributes.map((attribute, index) => {
    const position = point(index, 160 * scores.before[attribute.id] / 100);
    return `${position.x},${position.y}`;
  }).join(" ");

  return (
    <div className="optimization-profile" data-focus={selected} data-mode={comparison}>
      <div className="profile-heading"><span className="lab-overline">BUSINESS / HỒ SƠ VẬN HÀNH</span><span className="profile-mode"><i />{comparison === "after" ? "Có hỗ trợ" : "Tự xử lý"}</span></div>
      <div className="radar-arena">
        <svg className="radar-grid" viewBox="0 0 520 520" role="img" aria-label={`Radar ${data.attributes.length} thuộc tính, tỷ lệ quy đổi: ${data.attributes.map((attribute) => `${attribute.label} ${decimal(scores[comparison][attribute.id])}/100`).join(", ")}`}>
          <circle className="radar-disk" cx="260" cy="260" r="160" />
          {[40, 80, 120, 160].map((radius) => <circle className="radar-ring" key={radius} cx="260" cy="260" r={radius} />)}
          {data.attributes.map((attribute, index) => {
            const end = point(index, 174);
            return <path className="radar-axis" data-active={selected === attribute.id} key={attribute.id} d={`M260 260L${end.x} ${end.y}`} />;
          })}
        </svg>
        <div className="radar-shape radar-shape-edge" style={{ clipPath: clip }} aria-hidden="true" />
        <div className="radar-shape radar-shape-photo" style={{ clipPath: clip }}>
          <Image src={data.image} alt={data.imageAlt} fill loading="lazy" sizes="(max-width: 700px) 90vw, 500px" />
          <div className="radar-photo-shade" />
        </div>
        <svg className="radar-markers" viewBox="0 0 520 520" aria-hidden="true">
          {data.attributes.map((attribute, index) => {
            const end = point(index, 160);
            return <path className="radar-photo-axis" key={attribute.id} d={`M260 260L${end.x} ${end.y}`} />;
          })}
          {comparison === "after" && <polygon className="radar-baseline" points={baseline} />}
          {vertices.map((position, index) => <circle className="radar-vertex" data-active={data.attributes[index].id === selected} key={data.attributes[index].id} cx={position.x} cy={position.y} r="4" />)}
          <circle className="radar-center" cx="260" cy="260" r="3" />
        </svg>
        <div className="radar-attributes" role="group" aria-label="Chọn thuộc tính vận hành">
          {data.attributes.map((attribute, index) => {
            const position = point(index, 213);
            return <button type="button" className={`radar-attribute profile-attribute-${attribute.id}`} style={{ left: `${position.x / 5.2}%`, top: `${position.y / 5.2}%` }} key={attribute.id} aria-pressed={selected === attribute.id} aria-controls="profile-detail" onClick={() => setSelected(attribute.id)}>
              <span>{attribute.label}</span><strong>{decimal(scores[comparison][attribute.id])}<small>%</small></strong>
            </button>;
          })}
        </div>
      </div>
      <div className="radar-legend"><span><i />{comparison === "after" ? "Sau tối ưu" : "Trước tối ưu"}</span>{comparison === "after" && <span><i />Đường viền trước tối ưu</span>}</div>
      <div id="profile-detail" className="profile-detail" aria-live="polite" aria-atomic="true">
        <span className="profile-detail-icon"><Icon name={active.icon} size={20} /></span>
        <div><span>{active.caption}</span><p>{active.detail}</p></div><span className="radar-score">{decimal(scores.before[active.id])}<Icon name="right" size={14} /><strong>{decimal(scores.after[active.id])}</strong></span>
      </div>
      <p className="profile-hint">Mỗi đỉnh = tỷ lệ hiện tại × bán kính. Chỉ số càng cao, đỉnh càng ra ngoài.<br />Mốc 100: {data.capacity.reviews} review · {data.capacity.posts} nội dung · {data.capacity.reviews + data.capacity.posts} tác vụ. Đây là quy đổi đầu vào, không phải điểm hiệu quả.</p>
    </div>
  );
}

function MapPreview({ comparison, checklist }: { comparison: Comparison; checklist: LabContent["mapChecklist"] }) {
  const completed = checklist.filter((item) => item[comparison]).length;
  return (
    <div className={`lab-map-preview ${comparison}`}>
      <svg className="lab-map-art" viewBox="0 0 600 350" fill="none" aria-hidden="true"><defs><pattern id="lab-streets" width="65" height="65" patternUnits="userSpaceOnUse"><path d="M65 0H0V65" stroke="#57705d" strokeOpacity=".2" /></pattern></defs><rect width="600" height="350" fill="url(#lab-streets)" /><path d="M-40 280 180 95 650 210M130-20l155 390M480-20 350 390" stroke="#385743" strokeWidth="23" /><path className="lab-connection" d="M125 220 300 142 465 210M300 142l40 140M300 142 345 40" stroke={comparison === "after" ? "#c8df96" : "#7f9484"} strokeDasharray="5 6" strokeWidth="1.5" /><circle cx="300" cy="142" r="91" stroke="#b2c88e" strokeOpacity=".25" /><circle cx="300" cy="142" r="62" stroke="#b2c88e" strokeOpacity=".15" /><circle cx="125" cy="220" r="6" fill="#819b75" /><circle cx="465" cy="210" r="6" fill="#819b75" /><circle cx="340" cy="282" r="6" fill="#819b75" /></svg>
      <span className="lab-map-pin"><Icon name="pin" size={29} /></span>
      <span className="lab-map-tag">LOCAL PRESENCE / BẢN MINH HỌA</span>
      <div className="lab-business"><div className="lab-business-photo"><Image src="/images/restaurant.jpg" alt="Ảnh nhà hàng minh họa cho hồ sơ doanh nghiệp" fill sizes="70px" /></div><div><span>HỒ SƠ DOANH NGHIỆP MẪU</span><h4>Điểm đến của bạn</h4><p>{comparison === "after" ? "Thông tin rõ ràng. Điểm chạm nhất quán." : "Khách cần nhiều thông tin hơn để quyết định."}</p><small><Icon name={comparison === "after" ? "check" : "layers"} size={12} /> {completed}/{checklist.length} hạng mục trong checklist mẫu</small></div></div>
    </div>
  );
}

function WebsitePreview({ comparison }: { comparison: Comparison }) {
  return (
    <div className={`lab-website-preview ${comparison}`}>
      <div className="lab-browser-bar"><span /><span /><span /><small>yourbrand.vn / bản trải nghiệm</small><Icon name="globe" size={13} /></div>
      <div className="lab-browser-scene">
        <Image src="/images/restaurant.jpg" alt="Nhà hàng minh họa trên website mẫu" fill sizes="(max-width: 700px) 90vw, 600px" />
        <div className="lab-browser-shade" />
        <div className="lab-browser-copy"><span>YOUR PLACE. YOUR STORY.</span><h4>Một nơi đáng ghé.<br />Một trải nghiệm đáng nhớ.</h4>{comparison === "after" ? <a href="#contact">Kết nối với chúng tôi <Icon name="arrow" size={15} /></a> : <span className="lab-missing-cta">Chưa có điểm liên hệ trực tiếp</span>}</div>
      </div>
      <div className="lab-browser-footer"><span><Icon name={comparison === "after" ? "check" : "route"} size={15} />{comparison === "after" ? "Dịch vụ, thông tin và liên hệ trên cùng một điểm chạm." : "Thông tin rời rạc. Khách phải tự tìm cách kết nối."}</span></div>
    </div>
  );
}

export default function ImpactLab({ data }: { data: LabContent }) {
  const [view, setView] = useState<View>("operations");
  const [comparison, setComparison] = useState<Comparison>("after");
  const [reviews, setReviews] = useState(data.presets[1].reviews);
  const [posts, setPosts] = useState(data.presets[1].posts);
  const [assumptions, setAssumptions] = useState<WorkloadAssumptions>(data.assumptions);
  const result = calculateWorkload(reviews, posts, assumptions);
  const activeTab = data.tabs.find((tab) => tab.id === view)!;
  const checklistCompleted = data.mapChecklist.filter((item) => item[comparison]).length;
  const journey = data.websiteJourneys[comparison];
  const currentMinutes = comparison === "after" ? result.assistedMinutes : result.manualMinutes;
  const positiveSaving = result.savedMinutes >= 0;

  function selectTab(next: View) {
    setView(next);
  }

  function updateAssumption(key: keyof WorkloadAssumptions, value: string) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setAssumptions((current) => ({ ...current, [key]: Math.min(120, Math.max(0, parsed)) }));
  }

  return (
    <section id="impact" className="impact-section">
      <div className="site-container">
        <div className="impact-heading"><div><p className="eyebrow">{data.eyebrow}</p><h2>{data.title}<br /><span>{data.accent}</span></h2></div><p>{data.description}</p></div>
        <div className="lab-window">
          <div className="lab-toolbar"><div className="lab-workspace"><span className="lab-workspace-icon"><Icon name="grid" size={17} /></span><strong>HRank <span>/ Growth workspace</span></strong></div><span className="lab-demo-badge"><span /> MÔ PHỎNG TƯƠNG TÁC</span></div>
          <div className="lab-controls"><div className="lab-tabs" role="group" aria-label="Chọn giải pháp để xem mô phỏng">{data.tabs.map((tab) => <button type="button" key={tab.id} aria-pressed={view === tab.id} onClick={() => selectTab(tab.id as View)}><Icon name={tab.icon} size={16} /><span>{tab.service}</span></button>)}</div><div className="lab-comparison" role="group" aria-label="So sánh trước và sau tối ưu"><button type="button" aria-pressed={comparison === "before"} onClick={() => setComparison("before")}>Trước tối ưu</button><button type="button" aria-pressed={comparison === "after"} onClick={() => setComparison("after")}><Icon name="spark" size={13} />Sau tối ưu</button></div></div>

          <div className="lab-body" key={view}>
            <div className="lab-main">
              <div className="lab-view-heading"><div><span className="lab-overline">{activeTab.label.toUpperCase()}</span><h3>{view === "operations" ? "Trả thời gian về cho bạn." : view === "map" ? "Từ có mặt, đến chỉn chu." : "Từ quan tâm, đến kết nối."}</h3></div><span className="lab-stage-label"><span className={comparison === "after" ? "lab-status-dot after" : "lab-status-dot"} />{comparison === "after" ? "Cách làm được tối ưu" : "Kịch bản ban đầu"}</span></div>
              <div className="lab-metrics" aria-live="polite" aria-atomic="true">
                <div><span>{view === "operations" ? "Thời gian thao tác / tháng" : view === "map" ? "Checklist đã hoàn thiện" : "Bước mở kênh liên hệ"}</span><strong>{view === "operations" ? hours(currentMinutes) : view === "map" ? checklistCompleted : journey.length}<small>{view === "operations" ? "giờ" : view === "map" ? `/ ${data.mapChecklist.length} mục` : "bước"}</small></strong></div>
                <div><span>{view === "operations" ? "Khối lượng giả định" : view === "map" ? "Phần việc cần bổ sung" : "Phạm vi mô phỏng"}</span><strong>{view === "operations" ? result.taskCount : view === "map" ? data.mapChecklist.length - checklistCompleted : "01"}<small>{view === "operations" ? "tác vụ" : view === "map" ? "hạng mục" : "hành trình"}</small></strong></div>
                <div className="lab-metric-highlight"><span>{view === "operations" ? positiveSaving ? "Thời gian có thể tiết kiệm" : "Thời gian tăng thêm theo giả định" : "Đang xem"}</span><strong>{view === "operations" ? hours(Math.abs(result.savedMinutes)) : comparison === "after" ? "Sau" : "Trước"}<small>{view === "operations" ? "giờ / tháng" : "tối ưu"}</small></strong></div>
              </div>
              {view === "operations" ? <OptimizationProfile data={data.optimizationProfile} comparison={comparison} reviews={reviews} posts={posts} assumptions={assumptions} /> : view === "map" ? <MapPreview comparison={comparison} checklist={data.mapChecklist} /> : <WebsitePreview comparison={comparison} />}
              <div className="lab-main-note"><span className="lab-note-dot" />{view === "operations" ? "Thuộc tính minh họa cách vận hành. Thời gian tính từ giả định, không phải kết quả khách hàng thực tế." : view === "map" ? "Checklist mẫu, không phải điểm SEO, thứ hạng hoặc kết quả từ Google." : "Số bước theo hai luồng minh họa, không phải số liệu chuyển đổi hoặc cam kết hiệu quả."}</div>
            </div>

            <aside className="lab-inspector" aria-label="Đầu vào và giải thích mô phỏng">
              {view === "operations" ? <>
                <div className="lab-inspector-heading"><span className="lab-overline">DOANH NGHIỆP BẠN THÌ SAO?</span><h4>Tự thử con số của bạn.</h4><p>Kéo để thay khối lượng mỗi tháng.</p></div>
                <div className="lab-presets" role="group" aria-label="Chọn quy mô công việc">{data.presets.map((preset) => <button type="button" key={preset.id} aria-pressed={reviews === preset.reviews && posts === preset.posts} onClick={() => { setReviews(preset.reviews); setPosts(preset.posts); }}>{preset.label}</button>)}</div>
                <label className="lab-slider-label" htmlFor="lab-reviews">Đánh giá cần phản hồi <output htmlFor="lab-reviews">{reviews}</output></label><input className="lab-range" id="lab-reviews" type="range" min="0" max={data.optimizationProfile.capacity.reviews} step="10" value={reviews} onChange={(event) => setReviews(Number(event.target.value))} /><div className="lab-range-ends"><span>0 đánh giá</span><span>{data.optimizationProfile.capacity.reviews} đánh giá</span></div>
                <label className="lab-slider-label" htmlFor="lab-posts">Nội dung cần chuẩn bị <output htmlFor="lab-posts">{posts}</output></label><input className="lab-range" id="lab-posts" type="range" min="0" max={data.optimizationProfile.capacity.posts} value={posts} onChange={(event) => setPosts(Number(event.target.value))} /><div className="lab-range-ends"><span>0 nội dung</span><span>{data.optimizationProfile.capacity.posts} nội dung</span></div>
                <div className={`lab-saving ${positiveSaving ? "" : "negative"}`}>
                  <span><Icon name="spark" size={16} /> THEO ĐẦU VÀO HIỆN TẠI</span>
                  <p>{result.changePercent === null
                    ? "Chưa có thời gian gốc để so sánh tỷ lệ."
                    : <><strong>{decimal(Math.abs(result.changePercent))}%</strong> {positiveSaving ? "ít thời gian thao tác hơn" : "nhiều thời gian thao tác hơn"}</>}
                  </p>
                  <small>Không phải mức tiết kiệm được cam kết.</small>
                </div>
                <details className="lab-assumptions"><summary>Giả định & cách tính <Icon name="down" size={13} /></summary><p>Phút cho mỗi tác vụ. Có hỗ trợ vẫn bao gồm thời gian rà soát. Bạn có thể sửa các giả định này.</p><div className="lab-assumption-fields">{([
                  ["reviewManual", "Review · tự xử lý"],
                  ["reviewAssisted", "Review · có hỗ trợ"],
                  ["postManual", "Nội dung · tự xử lý"],
                  ["postAssisted", "Nội dung · có hỗ trợ"],
                ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min="0" max="120" step="1" value={assumptions[key]} onChange={(event) => updateAssumption(key, event.target.value)} /></label>)}</div><p>Phút/tháng = số review × phút/review + số nội dung × phút/nội dung. Thời gian chênh lệch = tự xử lý − có hỗ trợ. Chưa bao gồm thiết lập ban đầu, phối hợp và các tác vụ khác.</p></details>
              </> : view === "map" ? <>
                <div className="lab-inspector-heading"><span className="lab-overline">KHÔNG CHỈ LÀ MỘT GHIM TRÊN BẢN ĐỒ</span><h4>Khách cần đủ lý do<br />để lựa chọn bạn.</h4><p>Thử trước/sau để xem từng hạng mục thay đổi.</p></div><div className="lab-checklist">{data.mapChecklist.map((item) => <div key={item.label} data-complete={item[comparison]}><span><Icon name={item[comparison] ? "check" : "close"} size={13} /></span>{item.label}</div>)}</div><div className="lab-insight"><Icon name="pin" size={23} /><p>Thông tin được chăm chút giúp khách hiểu rõ hơn về doanh nghiệp. Vị trí hiển thị thực tế còn tùy nhiều yếu tố.</p></div>
              </> : <>
                <div className="lab-inspector-heading"><span className="lab-overline">BỚT MỘT BƯỚC, THÊM MỘT ĐIỂM CHẠM</span><h4>Khách không cần<br />đi tìm cách liên hệ.</h4><p>Hai luồng minh họa cho cùng một nhu cầu kết nối.</p></div><ol className="lab-journey">{journey.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol><div className="lab-insight"><Icon name="globe" size={23} /><p>Website gom thông tin và kênh liên hệ về một nơi. Nút trong bản mẫu dẫn tới phần tư vấn trên trang này.</p></div>
              </>}
            </aside>
          </div>
          <div className="lab-window-footer"><span><Icon name="layers" size={13} /> DỮ LIỆU GIẢ ĐỊNH · KHÔNG KẾT NỐI TÀI KHOẢN THỰC</span><a href="#contact">Cùng xem doanh nghiệp bạn <Icon name="arrow" size={14} /></a></div>
        </div>
        <div className="impact-disclaimer"><span className="info-symbol">i</span><p>{data.disclaimer}</p></div>
      </div>
    </section>
  );
}
