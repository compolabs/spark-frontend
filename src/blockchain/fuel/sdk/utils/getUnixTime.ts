export default function getUnixTime(time: string | number) {
  const date = new Date(time);
  return Math.floor(date.getTime() / 1000);
}
