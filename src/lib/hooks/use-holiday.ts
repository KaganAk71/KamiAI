import { useState, useEffect } from 'react'

export function useHolidayMode() {
    const [isHoliday, setIsHoliday] = useState(false)

    useEffect(() => {
        const checkHoliday = () => {
            const date = new Date()
            const month = date.getMonth() // 0-11
            const day = date.getDate()

            // December (11) 1st to January (0) 15th
            // Broad range to ensure it's visible now (Dec 31)
            if ((month === 11 && day >= 1) || (month === 0 && day <= 15)) {
                setIsHoliday(true)
            } else {
                setIsHoliday(false)
            }
        }

        checkHoliday()
    }, [])

    return isHoliday
}
