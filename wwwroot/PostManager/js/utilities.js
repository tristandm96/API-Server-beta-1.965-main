const formatDatefr = (timestamp) => {
    
    timestamp = timestamp.toString();

    const year = parseInt(timestamp.substring(0, 4), 10);
    const month = parseInt(timestamp.substring(4, 6), 10) - 1; // Months are 0-indexed
    const day = parseInt(timestamp.substring(6, 8), 10);
    const hours = parseInt(timestamp.substring(8, 10), 10);
    const minutes = parseInt(timestamp.substring(10, 12), 10);

    const date = new Date(year, month, day, hours, minutes);

    const months = [
        "janvier", "février", "mars", "avril", "mai", "juin", 
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];
    // French day names
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

    const dayName = days[date.getDay()]; 
    const monthName = months[date.getMonth()]; 

    const dayFormatted = String(date.getDate()).padStart(2, '0');
    const yearFormatted = date.getFullYear();
    const hoursFormatted = String(date.getHours()).padStart(2, '0');
    const minutesFormatted = String(date.getMinutes()).padStart(2, '0');
    
    return `${dayName} ${dayFormatted} ${monthName} ${yearFormatted} ${hoursFormatted}:${minutesFormatted}`;
};

