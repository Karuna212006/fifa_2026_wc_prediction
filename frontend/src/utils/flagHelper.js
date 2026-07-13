// Universal flag code mapping for all countries
export const getCountryCode = (countryName) => {
    if (!countryName) return 'xx';

    const name = countryName.toLowerCase().trim();

    // Direct mapping for common variations
    const mappings = {
        'france': 'fr',
        'germany': 'de',
        'spain': 'es',
        'portugal': 'pt',
        'england': 'gb-eng',
        'netherlands': 'nl',
        'belgium': 'be',
        'croatia': 'hr',
        'italy': 'it',
        'argentina': 'ar',
        'brazil': 'br',
        'uruguay': 'uy',
        'colombia': 'co',
        'mexico': 'mx',
        'usa': 'us',
        'canada': 'ca',
        'japan': 'jp',
        'south korea': 'kr',
        'morocco': 'ma',
        'senegal': 'sn',
        'australia': 'au',
        'switzerland': 'ch',
        'denmark': 'dk',
        'serbia': 'rs',
        'poland': 'pl',
        'ecuador': 'ec',
        'qatar': 'qa',
        'saudi arabia': 'sa',
        'iran': 'ir',
        'wales': 'gb-wls',
        'ghana': 'gh',
        'cameroon': 'cm',
        'tunisia': 'tn',
        'costa rica': 'cr',
        'uruguay': 'uy',
        'south korea': 'kr',
        'norway': 'no',
        'austria': 'at',
        'czech republic': 'cz',
        'ukraine': 'ua',
        'turkey': 'tr',
        'scotland': 'gb-sct',
        'ireland': 'ie',
        'new zealand': 'nz',
        'china': 'cn',
        'india': 'in',
    };

    return mappings[name] || name.substring(0, 2).toLowerCase();
};