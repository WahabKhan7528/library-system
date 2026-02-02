import React from "react";
import settingIcon from "../assets/setting.png";
import userIcon from "../assets/user.png";
import { useDispatch, useSelector } from "react-redux";
import { toggleSettingPopup } from "../store/slices/popUpSlice";

const Header = () => {
  const dispatch = useDispatch;
  const { user } = iseSelector((state) => state.auth);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // we will get hours from 1-23,to get it in 12 hours format we have written the following logic
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";

      setCurrentTime(`${hours}:${minutes}:${ampm}`);

      const options = { month: "short", dat: "numeric", year: "numeric" };
      setCurrentDate(now.toLocaleDateString("en-us", options));
    };

    updateDateTime();

    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <header className="absolute top-0 bg-white w-full py-4 px-6 left-0 flex justify-between items-center">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-2">
          <img src={userIcon} alt="userIcon" className="w-8 h-8" />
          <div className="flex flex-col">
            {/* If there is user. print the details */}
            <span className="text-sm font-medium sm:text-lg lg:text-xl sm:font-bold">{user && user.name}</span> 
            <span className="text-sm font-medium sm:text-lg sm:font-medium">{user && user.role}</span>

            {/* dummy data */}
            {/* <span>Wahab Khan</span>
            <span>Admin</span> */}
          </div>
        </div>


        {/* RIGHT SIDE */}
        {/* it will be hidden in mobile screen and when the screen ratio hits md it will apear as flex */}
        <div className="hidden md:flex items-center gap-2">
              <div className="flex flex-col text-sm lg:text-base items-end font-semibold">
                <span>{currentTime}</span>
                <span>{currentDate}</span>
              </div>\
              <span className="bg-black h-14 w-[2px]"/>
              <img src={settingIcon} alt="settingIcon"  className="w-8 h-8" onClick={()=>toggleSettingPopup}/>
        </div>
      </header>
    </>
  );
};

export default Header;
