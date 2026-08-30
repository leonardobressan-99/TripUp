import createPollIcon from "../assets/images/CreatePoll_Icon.webp";
import addExpenseIcon from "../assets/images/AddExpense_Icon.webp";
import addMemberIcon from "../assets/images/AddMember_Icon.webp";
import addTripIcon from "../assets/images/AddTrip_Icon.webp";

export function PollIcon() {
  return <img src={createPollIcon} alt="" className="w-full h-full object-contain" />;
}

export function ExpenseIcon() {
  return <img src={addExpenseIcon} alt="" className="w-full h-full object-contain" />;
}

export function MemberIcon() {
  return <img src={addMemberIcon} alt="" className="w-full h-full object-contain" />;
}

export function TripIcon() {
  return <img src={addTripIcon} alt="" className="w-full h-full object-contain" />;
}
