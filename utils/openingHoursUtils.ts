export const parseOpeningHours = (hours: string[]) => {
  const daysMap: { [key: string]: string } = {
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  };

  hours.forEach((hourString) => {
    const [day, hours] = hourString.split(": ");
    daysMap[day] = hours || "Closed";
  });

  return daysMap;
};
