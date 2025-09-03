import { useEffect, useRef } from "react";
// ⚠️ 이 import는 보통 URL 문자열로 번들됩니다.
// addGeoJson에 넣기 전에 fetch로 실제 JSON 객체를 받아 쓰겠습니다.
import busanDongraeGeoJsonUrl from "../../styles/assets/geojson/busan_dongrae.geojson";
// 네이버 지도 타입 선언
declare global {
  interface Window {
    naver: any;
  }
}

const HomePage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window.naver === "undefined" || !window.naver.maps) {
      console.error("네이버 지도 API가 로드되지 않았습니다.");
      return;
    }
    if (!mapRef.current) return;

    // 1) 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(35.205, 129.08), // 동래구 대략 중심
      zoom: 12,
      mapTypeId: window.naver.maps.MapTypeId.NORMAL,
    });
    mapInstanceRef.current = map;

    // 2) 툴팁 생성 (공식 가이드와 동일한 방식)
    const tooltip = document.createElement("div");
    tooltip.style.cssText =
      "position:absolute;z-index:1000;padding:5px 10px;background-color:#fff;border:solid 2px #000;font-size:14px;pointer-events:none;display:none;";
    map.getPanes().floatPane.appendChild(tooltip);

    // 3) 초기화 후 GeoJSON 로드
    window.naver.maps.Event.once(map, "init", async () => {
      try {
        // import가 URL일 수 있으므로 fetch → 객체화
        const res = await fetch(busanDongraeGeoJsonUrl as unknown as string);
        if (!res.ok) throw new Error(`GeoJSON fetch 실패: ${res.status}`);
        const geojson = await res.json();

        // 3-1) GeoJSON 스타일 설정 (공식 가이드와 동일)
        map.data.setStyle(function (feature: any) {
          const styleOptions = {
            fillColor: "#ff0000",
            fillOpacity: 0.0001,
            strokeColor: "#ff0000",
            strokeWeight: 2,
            strokeOpacity: 0.4,
          };

          if (feature.getProperty("focus")) {
            styleOptions.fillOpacity = 0.6;
            styleOptions.fillColor = "#0f0";
            styleOptions.strokeColor = "#0f0";
            styleOptions.strokeWeight = 4;
            styleOptions.strokeOpacity = 1;
          }

          return styleOptions;
        });

        // 3-2) GeoJSON 데이터 추가 (공식 가이드와 동일)
        map.data.addGeoJson(geojson);
        console.log("GeoJSON 데이터 추가 완료");

        // 3-3) 클릭 이벤트 리스너 추가 (공식 가이드와 동일)
        map.data.addListener("click", function (e: any) {
          const feature = e.feature;

          if (feature.getProperty("focus") !== true) {
            feature.setProperty("focus", true);
          } else {
            feature.setProperty("focus", false);
          }
        });

        // 3-4) 마우스오버 이벤트 리스너 추가 (공식 가이드와 동일)
        map.data.addListener("mouseover", function (e: any) {
          const feature = e.feature;
          const regionName = feature.getProperty("area1") || "부산 동래구";

          tooltip.style.display = "";
          tooltip.style.left = e.offset.x + "px";
          tooltip.style.top = e.offset.y + "px";
          tooltip.textContent = regionName;

          map.data.overrideStyle(feature, {
            fillOpacity: 0.6,
            strokeWeight: 4,
            strokeOpacity: 1,
          });
        });

        // 3-5) 마우스아웃 이벤트 리스너 추가 (공식 가이드와 동일)
        map.data.addListener("mouseout", function (e: any) {
          tooltip.style.display = "none";
          tooltip.textContent = "";
          map.data.revertStyle();
        });

        console.log("이벤트 리스너 추가 완료");
      } catch (err) {
        console.error("GeoJSON 로드/추가 오류:", err);
      }
    });

    // 정리
    return () => {
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
};

export default HomePage;
