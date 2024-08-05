import dayjs from "dayjs";

const getCurrentDate = () => dayjs().toISOString();

export { getCurrentDate };
