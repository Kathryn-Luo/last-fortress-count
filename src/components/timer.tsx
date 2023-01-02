import { useEffect, useState } from "react"

function Timer ({
  deadline
}: {
  deadline: string
}) {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const getTime = (deadlineTime: any) => {
    const time = Date.parse(deadlineTime) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  }, [])
  return (
    <span className='Timer'>
      {days}天 {hours}時 {minutes}分 {seconds < 10 ? `0${seconds}` : seconds}秒
    </span>
  )
}

export default Timer