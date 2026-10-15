export default async function handler(req, res) {
  const city = (req.query.city || '').trim();

  if (!city) {
    return res.status(400).json({
      error: "We couldn't find that city. Please check the spelling and try again."
    });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'The weather service is unavailable right now. Please try again later.'
    });
  }

  let data;
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    data = await response.json();
  } catch {
    return res.status(500).json({
      error: 'The weather service is unavailable right now. Please try again later.'
    });
  }

  // City not found
  if (data.error) {
    const code = data.error.code;
    if (code === 1003 || code === 1006) {
      return res.status(404).json({
        error: "We couldn't find that city. Please check the spelling and try again."
      });
    }
    return res.status(500).json({
      error: 'The weather service is unavailable right now. Please try again later.'
    });
  }

  const loc = data.location;
  const cur = data.current;

  res.status(200).json({
    city:        loc.name,
    country:     loc.country,
    localTime:   loc.localtime,
    description: cur.condition.text,
    icon:        'https:' + cur.condition.icon,
    tempC:       cur.temp_c,
    feelsLikeC:  cur.feelslike_c,
    humidity:    cur.humidity,
    windKph:     cur.wind_kph,
    windDir:     cur.wind_dir,
  });
}
