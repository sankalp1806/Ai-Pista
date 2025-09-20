import { CrowdCanvas } from "@/components/ui/skiper-ui/skiper39";

export const   CustomCrowd = () => {
  return (
    <div className="relative w-full h-[35vh] md:h-[45vh] lg:h-[55vh] bg-black">
      {/* TEMP: use an existing image so it renders now. Replace with /images/peeps/all-peeps.png when added to public. */}
      <CrowdCanvas src="/brand.png" rows={15} cols={7} />
    </div>
  );
};
