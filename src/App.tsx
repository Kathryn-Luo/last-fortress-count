import './App.css';
import Timer from './components/timer';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Radio, Button, DatePicker, DatePickerProps } from 'antd';
import { useState } from 'react';
import { recoverSecondOptions, chanceOptions, durabilityPreTimeOptions, carNumberOptions } from './settings'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

interface formType {
  recoverSeconds: number,
  recoverChances: number,
  recoverPreTimes: number,
  carNumber: number
}
const defaultValue = {
  recoverSeconds: recoverSecondOptions[0].value,
  recoverChances: 4,
  recoverPreTimes: 30,
  carNumber: 3
}

function App() {
  const [result, setResult] = useState<any>(null)
  const methods = useForm<formType>({ defaultValues: defaultValue })
  const { handleSubmit, reset } = methods
  // 台北時間 05/12 09:00 換算至使用者時區時間
  const endTimeAtTaipei = '2023/05/12 09:00'
  const dayjsTaipei = dayjs(endTimeAtTaipei).tz("Asia/Taipei")
  const dayjsTimeZone = dayjs.tz.guess()
  const [endTime, setEndTime] = useState<string>(dayjsTaipei.tz(dayjsTimeZone).format('YYYY/MM/DD HH:mm:ss'))

  const onSubmit = (data:any) => {
    setResult({...data})
  }
  const onReset = () => {
    setResult(null)
    reset()
  }

  const dateFormat = 'YYYY/MM/DD HH:mm:ss';
  const onDateOk = (
    value: DatePickerProps['value']
  ) => {
    setEndTime(dayjs(value).format('YYYY/MM/DD HH:mm:ss'))
  }

  return (
    <div className="App min-h-screen w-full bg-slate-800">
      <div className="max-w-lg mx-auto p-4 text-slate-50">
        <FormProvider {...methods} >
          <form onSubmit={handleSubmit(onSubmit)} className='table w-full border-spacing-2 text-left'>

            <div className='table-row text-yellow-300'>
              <p className='table-cell text-right pr-2'>活動結束時間</p>
              <DatePicker
                className='table-cell'
                showTime
                defaultValue={dayjs(endTime, dateFormat)}
                format={dateFormat}
                onOk={onDateOk} />
            </div>
            <div className='table-row text-yellow-300'>
              <p className='table-cell text-right pr-2 pb-5'>活動剩餘時間</p>
              <div className='table-cell pb-5'>
                <Timer deadline={endTime} />
              </div>
            </div>
            <TableRow name='recoverSeconds' label='1耐久值恢復時間' options={recoverSecondOptions} />
            <TableRow name='recoverChances' label='免費回體次數' options={chanceOptions} />
            <TableRow name='recoverPreTimes' label='修車廠單次恢復' options={durabilityPreTimeOptions} />
            <TableRow name='carNumber' label='擁有幾台卡車' options={carNumberOptions} />
          </form>
          <div className='text-center mt-2'>
            <Button onClick={onReset} type='default'>清除</Button>
            <Button onClick={handleSubmit(onSubmit)} type='primary'>查詢</Button>
          </div>
        </FormProvider>
        <br />
        {result && <Result endTime={endTime} result={result} />}
      </div>
      <p className='text-center text-slate-700'>version: 0.0.2</p>
    </div>
  );
}

function TableRow ({
  name,
  label,
  options
}: {
  name: string,
  label: string,
  options: {label: string, value: number}[]
}) {
  return (
    <div className='table-row'>
      <p className='table-cell text-right pr-2'>{label}</p>
      <RadioGroup className='table-cell' name={name} options={options} />
    </div>
  )
}

function RadioGroup ({
  name,
  options,
  className,
}: {
  name: string,
  options: {label: string, value: number}[],
  className: string
}) {
  const { control } = useFormContext ()
  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => (
        <Radio.Group
          {...field}
          className={className}
          size="small"
          options={options}
          optionType="button"
          buttonStyle="solid"
          />
        )}
      />
  )
}

function Result ({
  endTime,
  result
}: any) {
  const {
    recoverSeconds,
    carNumber,
    recoverChances,
    recoverPreTimes,
  } = result
  const remainingSeconds = Math.floor((Date.parse(endTime) - Date.now()) / 1000); // 剩餘秒數
  const remainingDays = Math.floor((remainingSeconds + 60 * 60 ) / 24 / 60 / 60) // 剩餘天數
  const remainingMz = remainingDays * 5
  const recoverPreCar = Math.floor(remainingSeconds / recoverSeconds) // 每一車可恢復耐久值
  const recoverDurability = recoverPreCar * carNumber + remainingDays * recoverChances * recoverPreTimes // 總共恢復耐久值
  const books = Math.floor((recoverDurability - remainingMz * 20) / 5) * 10 + remainingMz * 100

  const days = Math.floor(remainingSeconds / (60 * 60 * 24))
  const hours = Math.floor(remainingSeconds / (60 * 60) % 24)
  const minutes = Math.floor(remainingSeconds / 60 % 60)
  const seconds = Math.floor(remainingSeconds % 60)

  const onceWrenchRecover = carNumber * recoverPreTimes * remainingDays

  return (
    <div className='bg-slate-200/[.42] rounded-lg p-5 [&>p]:m-0'>
      <p className='font-bold text-yellow-300'>！！不計算當日變異喪屍、卡車維修次數，僅列入當日恢復體力！！</p>
      <br />
      <p>活動剩餘時間：{days}天 {hours}時 {minutes}分 {seconds}秒</p>
      <p>每車可恢復體力：{recoverPreCar}</p>
      <p>總共可獲得情報手冊：{books}本</p>
      <br/>
      <p>每天使用 5 板手 * {carNumber} 卡車</p>
      <p>每車可恢復體力：{recoverPreCar + onceWrenchRecover}</p>
      <p>總共可獲得情報手冊：{books + onceWrenchRecover / 5 * 10}本</p>
      <br />
      <p>每天使用 10 板手 * {carNumber} 卡車</p>
      <p>每車可恢復體力：{recoverPreCar + onceWrenchRecover * 2}</p>
      <p>總共可獲得情報手冊：{books + onceWrenchRecover / 5 * 10 * 2}本</p>
      
    </div>
  )
}


export default App;
