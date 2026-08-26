export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  EquipmentList: undefined;
  EquipmentDetails: { equipmentId: string };
  AddEquipment: { equipmentId?: string } | undefined;
  Booking: { equipmentId: string };
  MyBookings: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  Profile: undefined;
};
