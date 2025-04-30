import dayjs from 'dayjs'

import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)

import relativeTime from 'dayjs/plugin/relativeTime.js'
dayjs.extend(relativeTime)

import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(timezone)

import utc from 'dayjs/plugin/utc.js'
dayjs.extend(utc)

import weekday from 'dayjs/plugin/weekday.js'
dayjs.extend(weekday)

export default dayjs
