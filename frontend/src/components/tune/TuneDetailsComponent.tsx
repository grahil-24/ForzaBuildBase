const TuneDetailsComponent = ({tuneDetails}) => {

    return (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Tune Settings</h3>
          
          {/* Settings Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 items-start">
            
            {/* Tires Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Tires</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_tire_pressure} psi</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_tire_pressure} psi</span>
                </div>
              </div>
            </div>

            {/* Anti-Roll Bars Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Anti-Roll Bars</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front ARB</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_arb}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear ARB</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_arb}</span>
                </div>
              </div>
            </div>

            {/* Aero Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Aero</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Downforce</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_aero} lb</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Downforce</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_aero} lb</span>
                </div>
              </div>
            </div>

            {/* Springs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Springs</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Spring</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_spring} lb/in</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Spring</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_spring} lb/in</span>
                </div>
              </div>
            </div>

            {/* Ride Height Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Ride Height</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_ride_height} in</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_ride_height} in</span>
                </div>
              </div>
            </div>
            
            {/* Brakes Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Brakes</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Balance</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.brake_balance}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.brake_pressure}%</span>
                </div>
              </div>
            </div>

             {/* Damping Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Damping</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Rebound</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_rebound}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Rebound</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_rebound}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Bump</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_bump}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Bump</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_bump}</span>
                </div>
              </div>
            </div>

            {/* Differential Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Differential</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Accel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_diff_accel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Decel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_diff_decel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Accel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_diff_accel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Decel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_diff_decel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Center Balance</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.center_diff_balance}%</span>
                </div>
              </div>
            </div>

             {/* Alignment Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Alignment</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Camber</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_camber}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Camber</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_camber}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Toe</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_toe}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Toe</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_toe}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Caster</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_caster}°</span>
                </div>
              </div>
            </div>

             {/* Gearing Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Gearing</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Final Drive</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.final_drive}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}

export default TuneDetailsComponent;