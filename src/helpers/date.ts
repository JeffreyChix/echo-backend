import dayjs from "dayjs";

const getCurrentDate = () =>
    dayjs().format("dddd, MMM DD, YYYY [at] h:mma"); // e.g., Sunday, Aug 18, 2024 at 12:48pm

export { getCurrentDate };
