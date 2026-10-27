// All identifiers and prose below are fictional and authored for this sample.
export const demoRecords = [
  {
    id: 'example-a-1', model: 'DEMO-A', code: 'DEMO-001',
    source: 'Fictional reference A, revision 1, example 1',
    translations: {
      en: { title: 'Example reference for model A', explanation: 'This fictional record demonstrates an exact-model match. It is not a repair instruction.' },
      fr: { title: 'Exemple de référence pour le modèle A', explanation: 'Cette fiche fictive illustre une correspondance exacte du modèle. Ce n’est pas une instruction de réparation.' },
      fa: { title: 'مرجع نمونه برای مدل A', explanation: 'این دادهٔ ساختگی تطبیق دقیق مدل را نشان می‌دهد و دستور تعمیر نیست.' }
    }
  },
  {
    id: 'example-b-1', model: 'DEMO-B', code: 'DEMO-001',
    source: 'Fictional reference B, revision 1, example 1',
    translations: {
      en: { title: 'Different model, different reference', explanation: 'The same fictional code belongs to a separate model. The lookup must not borrow model A’s text.' }
    }
  }
];
