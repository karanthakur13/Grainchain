import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import RTLDefault from "views/rtl/default";
import CreateLot from "views/admin/createOrder";
import UpdateLot from "views/admin/updateOrder";
import TransferLot from "views/admin/transferLot";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdUpdate,
  MdCreate,
  MdEmojiTransportation,
} from "react-icons/md";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Create Lot",
    layout: "/admin",
    path: "create-lot",
    icon: <MdCreate className="h-6 w-6" />,
    component: <CreateLot />,
  },
  {
    name: "Transfer Lot",
    layout: "/admin",
    path: "transfer-lot",
    icon: <MdEmojiTransportation className="h-6 w-6" />,
    component: <TransferLot />,
  },
  {
    name: "Update Lot",
    layout: "/admin",
    path: "update-lot",
    icon: <MdUpdate className="h-6 w-6" />,
    component: <UpdateLot />,
  },
  /*  */
];
export default routes;
