import { winners } from "@/constants/winner";
import WinnerList from "./WinnerList";

const LastWinner = () => {
  return (
    <div className="p-5">
      <h2 className="text-center text-3xl text-purple-400 font-bold mb-4">
        সর্বশেষ বিজয়ী
      </h2>

      <WinnerList data={winners} />
    </div>
  );
};

export default LastWinner;
