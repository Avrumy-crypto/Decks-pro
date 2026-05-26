import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';

export function calculateFootings(totalPosts: number, _height_ft: number, config: MaterialsConfig): BOMLine[] {
  const { footings } = config;

  const footingDepth_ft = config.posts.embedDepth_ft + 0.5;
  const extraDepth = Math.max(0, footingDepth_ft - footings.baselineDepth_ft);
  const bagsPerFooting = Math.max(footings.bagsPerFooting_80lb, Math.ceil(
    footings.bagsPerFooting_80lb + extraDepth * footings.extraBagsPerFtDepth
  ));
  const totalBags = totalPosts * bagsPerFooting;

  return [
    {
      id: 'tube-forms',
      category: 'footings',
      description: `Tube Forms (${footings.diameter_in}" dia)`,
      size: `${footings.diameter_in}" diameter`,
      quantity: totalPosts,
      unit: 'pcs',
      notes: `One per post, ${footingDepth_ft.toFixed(1)} ft deep`,
    },
    {
      id: 'concrete-bags',
      category: 'footings',
      description: '80 lb Concrete Bags',
      size: '80 lb bag',
      quantity: totalBags,
      unit: 'bags',
      notes: `${bagsPerFooting} bags per footing × ${totalPosts} posts`,
    },
  ];
}
