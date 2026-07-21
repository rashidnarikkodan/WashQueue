import type { Vehicle } from "../types"

type Props = {
    vehicle:Vehicle
    image:string
    className:string
    categoryName:string
}

const VehicleCard = ({vehicle,image,categoryName,className}:Props) => {
            return (
            <div
              key={vehicle.id}
              className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-border/80 transition-all duration-300"
            >
              {/* Image and status badge */}
              <div className="h-56 relative overflow-hidden">
                <img
                  src={image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />

                <span
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md bg-emerald-500/25 text-emerald-400 border border-emerald-500/25"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Good Condition
                </span>

                {vehicle.isPrimary && (
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md">
                    PRIMARY
                  </span>
                )}
              </div>

              {/* Body details */}
              <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Brand & Plate */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 tracking-wider">
                        {vehicle.registrationNumber || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-muted/80 text-muted-foreground text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                        {categoryName.toUpperCase()}
                      </span>
                      <span className="bg-muted/80 text-muted-foreground text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                        {className.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specs Details Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-border pt-4">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                        Model Year
                      </span>
                      <span className="text-sm font-bold text-foreground">{vehicle.year}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                        Last Wash
                      </span>
                      <span className="text-sm font-bold text-foreground">N/A</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                        Next Wash
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        In 14 Days
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                        Usage
                      </span>
                      <span className="text-sm font-bold text-foreground">Daily</span>
                    </div>
                  </div>
                </div>

                {/* Quick Buttons */}
                <div className="flex gap-3 pt-6">
                  <button className="flex-1 py-3 px-4 rounded-xl bg-muted hover:bg-muted text-muted-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer">
                    View Details
                  </button>
                  <button className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10">
                    Book Wash
                  </button>
                </div>
              </div>
            </div>
          )
}

export default VehicleCard