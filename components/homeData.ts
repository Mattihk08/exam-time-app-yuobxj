
export const modalDemos = [
  {
    title: "Standard Modal",
    description: "Full screen modal presentation",
    route: "/modal",
    color: "#60A5FA", // Light blue
  },
  {
    title: "Form Sheet",
    description: "Bottom sheet with detents and grabber",
    route: "/formsheet",
    color: "#3B82F6", // Medium blue
  },
  {
    title: "Transparent Modal",
    description: "Overlay without obscuring background",
    route: "/transparent-modal",
    color: "#93C5FD", // Lighter blue
  }
];

export type ModalDemo = typeof modalDemos[0];
