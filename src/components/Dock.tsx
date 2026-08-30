import phoneIcon from "../assets/images/Dock_Phone2.webp";
import appStoreIcon from "../assets/images/Dock_AppStore.webp";
import cameraIcon from "../assets/images/Dock_Camera.webp";
import clockIcon from "../assets/images/Dock_Clock.webp";

export default function Dock() {
  return (
    <div className="absolute bottom-[38px] left-[18px] right-[18px] h-[92px] rounded-[36px] bg-white/15 backdrop-blur-xl flex items-center justify-between px-[18px]">
      <img src={phoneIcon} alt="" className="w-[64px] h-[64px] object-contain" />
      <img src={appStoreIcon} alt="" className="w-[64px] h-[64px] object-contain" />
      <img src={cameraIcon} alt="" className="w-[64px] h-[64px] object-contain" />
      <img src={clockIcon} alt="" className="w-[64px] h-[64px] object-contain" />
    </div>
  );
}
