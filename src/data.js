export const muscles = {
    chest: ['سینه', 'Chest', ['upper-pectoralis', 'mid-lower-pectoralis']],
    shoulders: ['سرشانه', 'Shoulders', ['anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid']],
    biceps: ['جلو بازو', 'Biceps', ['short-head-bicep', 'long-head-bicep']],
    triceps: ['پشت بازو', 'Triceps', ['medial-head-triceps', 'long-head-triceps', 'lateral-head-triceps', 'later-head-triceps']],
    forearms: ['ساعد', 'Forearms', ['wrist-flexors', 'wrist-extensors']],
    abs: ['شکم', 'Abdominals', ['upper-abdominals', 'lower-abdominals']],
    obliques: ['پهلو', 'Obliques', ['obliques']],
    quads: ['چهارسر ران', 'Quadriceps', ['outer-quadricep', 'rectus-femoris', 'inner-quadricep']],
    hamstrings: ['همسترینگ', 'Hamstrings', ['medial-hamstrings', 'lateral-hamstrings']],
    glutes: ['باسن', 'Glutes', ['gluteus-maximus', 'gluteus-medius']],
    calves: ['ساق پا', 'Calves', ['gastrocnemius', 'soleus', 'tibialis']],
    back: ['عضلات پشت', 'Back', ['lats', 'lowerback', 'lower-trapezius', 'traps-middle']],
    traps: ['کول', 'Trapezius', ['upper-trapezius', 'upper-trapzeius']],
    adductors: ['داخل ران', 'Adductors', ['inner-thigh']]
};
export const equipment = [['featured', 'منتخب', 'Sparkles'], ['barbell', 'هالتر', 'Dumbbell'], ['dumbbell', 'دمبل', 'Dumbbell'], ['bodyweight', 'وزن بدن', 'PersonStanding'], ['machine', 'دستگاه', 'Cable'], ['medicine', 'توپ پزشکی', 'Circle'], ['kettlebell', 'کتل‌بل', 'Weight'], ['stretch', 'حرکات کششی', 'Accessibility'], ['cable', 'سیم‌کش', 'Cable'], ['band', 'کش ورزشی', 'Waves'], ['plate', 'صفحه وزنه', 'Disc3'], ['trx', 'TRX', 'MoveUpRight'], ['yoga', 'یوگا', 'Flower2'], ['bosu', 'توپ بوسو', 'CircleDot'], ['vitruvian', 'ویتروویَن', 'Activity'], ['cardio', 'هوازی', 'HeartPulse'], ['smith', 'دستگاه اسمیت', 'Columns3'], ['recovery', 'ریکاوری', 'RefreshCw']];
const rows = [
    ['chest', 'barbell', 'پرس سینه هالتر', 'Barbell bench press'], ['chest', 'dumbbell', 'پرس سینه دمبل', 'Dumbbell bench press'], ['chest', 'bodyweight', 'شنا سوئدی', 'Push-up'], ['chest', 'cable', 'کراس اور سیم‌کش', 'Cable fly'],
    ['shoulders', 'dumbbell', 'پرس سرشانه دمبل', 'Dumbbell shoulder press'], ['shoulders', 'dumbbell', 'نشر جانب', 'Lateral raise'], ['shoulders', 'barbell', 'پرس سرشانه هالتر', 'Overhead press'],
    ['biceps', 'dumbbell', 'جلو بازو دمبل', 'Dumbbell curl'], ['biceps', 'barbell', 'جلو بازو هالتر', 'Barbell curl'], ['biceps', 'cable', 'جلو بازو سیم‌کش', 'Cable curl'],
    ['triceps', 'cable', 'پشت بازو سیم‌کش', 'Triceps pushdown'], ['triceps', 'dumbbell', 'پشت بازو دمبل بالای سر', 'Overhead triceps extension'], ['triceps', 'bodyweight', 'دیپ', 'Dip'],
    ['forearms', 'dumbbell', 'ساعد دمبل', 'Wrist curl'], ['abs', 'bodyweight', 'کرانچ', 'Crunch'], ['abs', 'bodyweight', 'پلانک', 'Plank'], ['obliques', 'bodyweight', 'پلانک پهلو', 'Side plank'],
    ['quads', 'barbell', 'اسکوات هالتر', 'Barbell squat'], ['quads', 'dumbbell', 'اسکوات جام', 'Goblet squat'], ['quads', 'machine', 'جلو پا دستگاه', 'Leg extension'],
    ['hamstrings', 'barbell', 'ددلیفت رومانیایی', 'Romanian deadlift'], ['hamstrings', 'machine', 'پشت پا دستگاه', 'Leg curl'], ['glutes', 'barbell', 'هیپ تراست', 'Hip thrust'], ['glutes', 'bodyweight', 'پل باسن', 'Glute bridge'],
    ['calves', 'bodyweight', 'ساق پا ایستاده', 'Standing calf raise'], ['calves', 'machine', 'ساق پا نشسته', 'Seated calf raise'], ['back', 'bodyweight', 'بارفیکس', 'Pull-up'], ['back', 'cable', 'لت سیم‌کش', 'Lat pulldown'], ['back', 'dumbbell', 'زیربغل دمبل تک دست', 'Dumbbell row'], ['traps', 'dumbbell', 'شراگ دمبل', 'Dumbbell shrug'], ['adductors', 'machine', 'داخل ران دستگاه', 'Hip adduction']
];
export const exercises = rows.map(([muscle, equipment, name, en], i) => ({ id: i, muscle, equipment, name, en }));
